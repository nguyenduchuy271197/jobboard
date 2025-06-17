"use server";

import { createClient } from "@/lib/supabase/server";

type Result = 
  | { success: true } 
  | { success: false; error: string };

export async function logoutUser(): Promise<Result> {
  try {
    // 1. Create Supabase client
    const supabase = await createClient();

    // 2. Sign out user
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Đã có lỗi xảy ra khi đăng xuất" };
  }
} 