"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  company_id: z.number().positive(),
  reason: z.string().min(1, "Lý do xóa là bắt buộc"),
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

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Check admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return { success: false, error: "Không có quyền truy cập" };
    }

    // 4. Check if company exists and get related data
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select(`
        id, 
        name, 
        owner_id,
        jobs:jobs(count)
      `)
      .eq("id", company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: "Không tìm thấy công ty" };
    }

    // 5. Check for active jobs
    const { data: activeJobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id")
      .eq("company_id", company_id)
      .eq("status", "published");

    if (jobsError) {
      return { success: false, error: "Không thể kiểm tra việc làm của công ty" };
    }

    if (activeJobs && activeJobs.length > 0) {
      return { success: false, error: "Không thể xóa công ty có việc làm đang hoạt động. Vui lòng đóng tất cả việc làm trước." };
    }

    // 6. Check for pending applications
    const { data: pendingApplications, error: applicationsError } = await supabase
      .from("applications")
      .select("id")
      .in("job_id", 
        await supabase
          .from("jobs")
          .select("id")
          .eq("company_id", company_id)
          .then(({ data }) => data?.map(job => job.id) || [])
      )
      .in("status", ["pending", "reviewing", "interviewing"]);

    if (applicationsError) {
      return { success: false, error: "Không thể kiểm tra đơn ứng tuyển" };
    }

    if (pendingApplications && pendingApplications.length > 0) {
      return { success: false, error: "Không thể xóa công ty có đơn ứng tuyển đang chờ xử lý. Vui lòng xử lý tất cả đơn ứng tuyển trước." };
    }

    // 7. Delete company (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("companies")
      .delete()
      .eq("id", company_id);

    if (deleteError) {
      return { success: false, error: "Không thể xóa công ty" };
    }

    // TODO: Send notification email to company owner
    // TODO: Log deletion for audit trail
    console.log(`Company ${company_id} deleted by admin. Reason: ${reason}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
} 