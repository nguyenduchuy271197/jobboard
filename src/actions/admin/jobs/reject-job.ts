"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";

const schema = z.object({
  job_id: z.number().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
  reason: z.string().optional().transform(val => val?.trim()),
});

type Result = { success: true } | { success: false; error: string };

export async function rejectJob(params: { job_id: number; reason?: string }): Promise<Result> {
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
      .select("id, status")
      .eq("id", data.job_id)
      .single();

    if (jobError || !job) {
      return { success: false, error: ERROR_MESSAGES.JOB.NOT_FOUND };
    }

    // 4. Update status to draft (rejected)
    const { error: updateError } = await supabase
      .from("jobs")
      .update({ 
        status: "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.job_id);

    if (updateError) {
      return { success: false, error: ERROR_MESSAGES.JOB.UPDATE_FAILED };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 