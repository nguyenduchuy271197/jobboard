"use server";

import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

type Result = 
  | { success: true; data: { user_id: string } } 
  | { success: false; error: string };

export async function deleteJobSeekerProfile(): Promise<Result> {
  try {
    // 1. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 2. Check if profile exists
    const supabase = await createClient();
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
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
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
      return { success: false, error: "Không thể xóa hồ sơ ứng viên" };
    }

    return { success: true, data: { user_id: user.id } };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 