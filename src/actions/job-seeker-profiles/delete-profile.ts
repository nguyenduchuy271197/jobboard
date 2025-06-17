"use server";

import { createClient } from "@/lib/supabase/server";

type Result = 
  | { success: true; data: { user_id: string } } 
  | { success: false; error: string };

export async function deleteJobSeekerProfile(): Promise<Result> {
  try {
    // 1. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để xóa hồ sơ" };
    }

    // 2. Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("job_seeker_profiles")
      .select("user_id, cv_file_path")
      .eq("user_id", user.id)
      .single();

    if (profileError || !existingProfile) {
      return { success: false, error: "Hồ sơ ứng viên không tồn tại" };
    }

    // 3. Check for dependencies (job applications)
    const { count: applicationCount, error: applicationError } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("applicant_id", user.id);

    if (applicationError) {
      return { success: false, error: "Lỗi khi kiểm tra đơn ứng tuyển liên quan" };
    }

    if (applicationCount && applicationCount > 0) {
      return { 
        success: false, 
        error: `Không thể xóa hồ sơ vì còn ${applicationCount} đơn ứng tuyển đang liên kết` 
      };
    }

    // 4. Delete CV file from storage if exists
    if (existingProfile.cv_file_path) {
      const fileName = existingProfile.cv_file_path.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('cvs')
          .remove([`${user.id}/${fileName}`]);
      }
    }

    // 5. Delete profile
    const { error } = await supabase
      .from("job_seeker_profiles")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { user_id: user.id } };
  } catch {
    return { success: false, error: "Đã có lỗi xảy ra khi xóa hồ sơ ứng viên" };
  }
} 