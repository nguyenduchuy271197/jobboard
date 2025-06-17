"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { UpdateUserRoleData } from "@/types/custom.types";

const schema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["job_seeker", "employer", "admin"]),
});

type Result = { success: true } | { success: false; error: string };

export async function updateUserRole(params: UpdateUserRoleData): Promise<Result> {
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

    // Không cho phép tự thay đổi role của chính mình
    if (data.user_id === user.id) {
      return { success: false, error: "Bạn không thể thay đổi vai trò của chính mình" };
    }

    // Kiểm tra user tồn tại
    const { data: targetUser } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", data.user_id)
      .single();

    if (!targetUser) {
      return { success: false, error: "Người dùng không tồn tại" };
    }

    // Cập nhật role
    const { error } = await supabase
      .from("profiles")
      .update({ 
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user_id);

    if (error) {
      return { success: false, error: "Không thể cập nhật vai trò người dùng" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Lỗi hệ thống" };
  }
} 