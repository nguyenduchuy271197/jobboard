"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  user_id: z.string().uuid(),
});

type Result = { success: true } | { success: false; error: string };

export async function deactivateUser(params: { user_id: string }): Promise<Result> {
  try {
    const data = schema.parse(params);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    // Kiểm tra quyền admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Không cho phép deactivate chính mình
    if (data.user_id === user.id) {
      return { success: false, error: "Bạn không thể vô hiệu hóa tài khoản của chính mình" };
    }

    // Kiểm tra user tồn tại
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id, is_active")
      .eq("id", data.user_id)
      .single();

    if (!targetUser) {
      return { success: false, error: "Người dùng không tồn tại" };
    }

    if (!targetUser.is_active) {
      return { success: false, error: "Tài khoản đã bị vô hiệu hóa" };
    }

    // Deactivate user
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user_id);

    if (error) {
      return { success: false, error: "Không thể vô hiệu hóa tài khoản người dùng" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Lỗi hệ thống" };
  }
} 