"use server";

import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

type Result = 
  | { success: true; data: { message: string } } 
  | { success: false; error: string };

export async function deleteResume(): Promise<Result> {
  try {
    // 1. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 2. Get current profile with CV path
    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("job_seeker_profiles")
      .select("user_id, cv_file_path")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Hồ sơ ứng viên không tồn tại" };
    }

    if (!profile.cv_file_path) {
      return { success: false, error: "Không có CV để xóa" };
    }

    // 3. Delete CV file from storage
    const { error: storageError } = await supabase.storage
      .from('cvs')
      .remove([profile.cv_file_path]);

    if (storageError) {
      console.error("Storage delete error:", storageError);
      // Continue even if storage delete fails
    }

    // 4. Update profile to remove CV path
    const { error: updateError } = await supabase
      .from("job_seeker_profiles")
      .update({ 
        cv_file_path: null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (updateError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    return { success: true, data: { message: "CV đã được xóa thành công" } };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 