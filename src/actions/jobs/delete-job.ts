"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

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

    // 2. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để xóa việc làm" };
    }

    // 3. Check if job exists and user has permission
    const { data: existingJob, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, company_id")
      .eq("id", data.id)
      .single();

    if (jobError || !existingJob) {
      return { success: false, error: "Việc làm không tồn tại" };
    }

    // Check company ownership
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("owner_id")
      .eq("id", existingJob.company_id)
      .single();

    if (companyError || !company) {
      return { success: false, error: "Công ty không tồn tại" };
    }

    if (company.owner_id !== user.id) {
      return { success: false, error: "Bạn không có quyền xóa việc làm này" };
    }

    // 4. Check for dependencies (job applications)
    const { count: applicationCount, error: applicationError } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("job_id", data.id);

    if (applicationError) {
      return { success: false, error: "Lỗi khi kiểm tra đơn ứng tuyển liên quan" };
    }

    if (applicationCount && applicationCount > 0) {
      return { 
        success: false, 
        error: `Không thể xóa việc làm vì còn ${applicationCount} đơn ứng tuyển đang liên kết` 
      };
    }

    // 5. Delete job
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", data.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { id: data.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi xóa việc làm" };
  }
} 