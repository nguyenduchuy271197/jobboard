"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";

const schema = z.object({
  company_id: z.number().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
  reason: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD).transform(val => val.trim()),
});

type Result = 
  | { success: true }
  | { success: false; error: string };

export async function deleteCompany(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    const { company_id, reason } = schema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // 3. Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, name, owner_id")
      .eq("id", company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
    }

    // 4. Check for active jobs
    const { data: activeJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id")
      .eq("company_id", company_id)
      .eq("status", "published");

    if (jobsError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (activeJobs && activeJobs.length > 0) {
      return { 
        success: false, 
        error: `Không thể xóa công ty vì còn ${activeJobs.length} việc làm đang hoạt động. Vui lòng đóng tất cả việc làm trước.` 
      };
    }

    // 5. Get job IDs for application check
    const { data: companyJobs, error: companyJobsError } = await supabase
      .from("jobs")
      .select("id")
      .eq("company_id", company_id);

    if (companyJobsError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    // 6. Check for pending applications
    if (companyJobs && companyJobs.length > 0) {
      const jobIds = companyJobs.map(job => job.id);
      const { data: pendingApplications, error: applicationsError } = await supabase
        .from("applications")
        .select("id")
        .in("job_id", jobIds)
        .in("status", ["pending", "reviewing", "interviewing"]);

      if (applicationsError) {
        return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
      }

      if (pendingApplications && pendingApplications.length > 0) {
        return { 
          success: false, 
          error: `Không thể xóa công ty vì còn ${pendingApplications.length} đơn ứng tuyển đang chờ xử lý. Vui lòng xử lý tất cả đơn ứng tuyển trước.` 
        };
      }
    }

    // 7. Delete company (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", company_id);

    if (deleteError) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.DELETE_FAILED };
    }

    // TODO: Send notification email to company owner
    // TODO: Log deletion for audit trail
    console.log(`Company ${company_id} deleted by admin. Reason: ${reason}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 