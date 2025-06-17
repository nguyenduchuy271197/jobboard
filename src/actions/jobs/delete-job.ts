"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile, checkCompanyAccess } from "@/lib/auth-utils";

const deleteJobSchema = z.object({
  id: z.number().int().positive("ID việc làm không hợp lệ"),
});

type DeleteJobParams = z.infer<typeof deleteJobSchema>;
type Result = 
  | { success: true; data: { id: number } } 
  | { success: false; error: string };

export async function deleteJob(params: DeleteJobParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = deleteJobSchema.parse(params);

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check if job exists
    const supabase = await createClient();
    const { data: existingJob, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, company_id")
      .eq("id", data.id)
      .single();

    if (jobError || !existingJob) {
      return { success: false, error: ERROR_MESSAGES.JOB.NOT_FOUND };
    }

    // 4. Check company access
    const companyCheck = await checkCompanyAccess(existingJob.company_id);
    if (!companyCheck.success) {
      return { success: false, error: companyCheck.error };
    }

    // 5. Check for dependencies (job applications)
    const { count: applicationCount, error: applicationError } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", data.id);

    if (applicationError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (applicationCount && applicationCount > 0) {
      return { 
        success: false, 
        error: `Không thể xóa việc làm vì còn ${applicationCount} đơn ứng tuyển đang liên kết` 
      };
    }

    // 6. Delete job
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", data.id);

    if (error) {
      return { success: false, error: ERROR_MESSAGES.JOB.DELETE_FAILED };
    }

    return { success: true, data: { id: data.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 