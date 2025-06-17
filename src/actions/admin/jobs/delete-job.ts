"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";

const schema = z.object({
  job_id: z.number().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
});

type Result = { success: true } | { success: false; error: string };

export async function deleteJob(params: { job_id: number }): Promise<Result> {
  try {
    // 1. Validate input
    const data = schema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // 3. Check if job exists
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", data.job_id)
      .single();

    if (jobError || !job) {
      return { success: false, error: ERROR_MESSAGES.JOB.NOT_FOUND };
    }

    // 4. Check for applications
    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", data.job_id)
      .limit(1);

    if (applicationsError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (applications && applications.length > 0) {
      return { success: false, error: "Không thể xóa công việc đã có người ứng tuyển" };
    }

    // 5. Delete job
    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", data.job_id);

    if (deleteError) {
      return { success: false, error: ERROR_MESSAGES.JOB.DELETE_FAILED };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 