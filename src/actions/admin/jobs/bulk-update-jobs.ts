"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import type { BulkUpdateJobsData } from "@/types/custom.types";

const schema = z.object({
  job_ids: z.array(z.number().positive()).min(1).max(50),
  action: z.enum(["approve", "reject", "archive", "delete"]),
  reason: z.string().optional().transform(val => val?.trim()),
});

type Result = { 
  success: true; 
  data: {
    updated: number;
    failed: number;
  }
} | { 
  success: false; 
  error: string 
};

export async function bulkUpdateJobs(params: BulkUpdateJobsData): Promise<Result> {
  try {
    // 1. Validate input
    const data = schema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    let updated = 0;
    let failed = 0;

    // 3. Process each job
    for (const jobId of data.job_ids) {
      try {
        const updateData: Partial<{
          status: "draft" | "pending_approval" | "published" | "closed" | "archived";
          updated_at: string;
          published_at?: string;
        }> = {
          updated_at: new Date().toISOString(),
        };

        switch (data.action) {
          case "approve":
            updateData.status = "published";
            updateData.published_at = new Date().toISOString();
            break;
          case "reject":
            updateData.status = "draft";
            break;
          case "archive":
            updateData.status = "archived";
            break;
          case "delete":
            // Check for applications
            const { data: applications } = await supabase
              .from("applications")
              .select("id")
              .eq("job_id", jobId)
              .limit(1);

            if (applications && applications.length > 0) {
              failed++;
              continue;
            }

            const { error: deleteError } = await supabase
              .from("jobs")
              .delete()
              .eq("id", jobId);

            if (deleteError) {
              failed++;
            } else {
              updated++;
            }
            continue;
        }

        const { error } = await supabase
          .from("jobs")
          .update(updateData)
          .eq("id", jobId);

        if (error) {
          failed++;
        } else {
          updated++;
        }
      } catch {
        failed++;
      }
    }

    return {
      success: true,
      data: {
        updated,
        failed,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 