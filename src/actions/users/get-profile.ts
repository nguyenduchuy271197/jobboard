"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/custom.types";

type Result = 
  | { success: true; data: Profile } 
  | { success: false; error: string };

export async function getUserProfile(): Promise<Result> {
  try {
    // 1. Create Supabase client
    const supabase = await createClient();

    // 2. Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    if (!profile) {
      return { success: false, error: "Profile không tồn tại" };
    }

    return { success: true, data: profile };
  } catch {
    return { success: false, error: "Đã có lỗi xảy ra khi lấy thông tin profile" };
  }
} 