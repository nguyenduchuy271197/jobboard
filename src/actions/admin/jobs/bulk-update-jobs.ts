"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { BulkUpdateJobsData } from "@/types/custom.types";

const schema = z.object({
  job_ids: z.array(z.number()).min(1).max(50),
  action: z.enum(["approve", "reject", "archive", "delete"]),
  reason: z.string().optional(),
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
    const data = schema.parse(params);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    // Kiểm tra quyền admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    let updated = 0;
    let failed = 0;

    // Xử lý từng job
    for (const jobId of data.job_ids) {
      try {
        const updateData: Partial<{
          status: "draft" | "pending_approval" | "published" | "closed" | "archived";
          updated_at: string;
        }> = {
          updated_at: new Date().toISOString(),
        };

        switch (data.action) {
          case "approve":
            updateData.status = "published";
            break;
          case "reject":
            updateData.status = "draft";
            break;

          case "archive":
            updateData.status = "archived";
            break;
          case "delete":
            // Kiểm tra có applications không
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
    return { success: false, error: "Lỗi hệ thống" };
  }
} 