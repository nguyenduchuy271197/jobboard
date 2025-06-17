"use server";

import { createClient } from "@/lib/supabase/server";
import { JobSeekerProfile } from "@/types/custom.types";

type Result = 
  | { success: true; data: JobSeekerProfile } 
  | { success: false; error: string };

export async function getCurrentJobSeekerProfile(): Promise<Result> {
  try {
    // 1. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để xem hồ sơ" };
    }

    // 2. Execute query with relations
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
      return { success: false, error: error.message };
    }

    if (!profile) {
      return { success: false, error: "Bạn chưa tạo hồ sơ ứng viên" };
    }

    return { success: true, data: profile };
  } catch {
    return { success: false, error: "Đã có lỗi xảy ra khi lấy thông tin hồ sơ của bạn" };
  }
} 