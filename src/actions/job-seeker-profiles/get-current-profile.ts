"use server";

import { createClient } from "@/lib/supabase/server";
import { JobSeekerProfile } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

type Result = 
  | { success: true; data: JobSeekerProfile } 
  | { success: false; error: string };

export async function getCurrentJobSeekerProfile(): Promise<Result> {
  try {
    // 1. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 2. Execute query with relations
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("job_seeker_profiles")
      .select(`
        *,
        user:users(id, email, full_name, avatar_url),
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Bạn chưa tạo hồ sơ ứng viên" };
      }
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (!profile) {
      return { success: false, error: "Bạn chưa tạo hồ sơ ứng viên" };
    }

    return { success: true, data: profile };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 