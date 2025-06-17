"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Profile, UserRole } from "@/types/custom.types";

const changeRoleSchema = z.object({
  userId: z.string().uuid("User ID không hợp lệ"),
  newRole: z.enum(["job_seeker", "employer", "admin"] as const),
});

type ChangeRoleParams = z.infer<typeof changeRoleSchema>;
type Result = 
  | { success: true; data: Profile } 
  | { success: false; error: string };

export async function changeUserRole(params: ChangeRoleParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = changeRoleSchema.parse(params);

    // 2. Create Supabase client and check auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Check if current user is admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    if (currentUserProfile?.role !== "admin") {
      return { success: false, error: "Chỉ admin mới có thể thay đổi role" };
    }

    // 4. Check if target user exists
    const { data: targetUser, error: targetUserError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.userId)
      .single();

    if (targetUserError) {
      return { success: false, error: "Người dùng không tồn tại" };
    }

    if (!targetUser) {
      return { success: false, error: "Người dùng không tồn tại" };
    }

    // 5. Prevent changing own role to non-admin (safety check)
    if (data.userId === user.id && data.newRole !== "admin") {
      return { success: false, error: "Không thể thay đổi role của chính mình khỏi admin" };
    }

    // 6. Update user role
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ 
        role: data.newRole as UserRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.userId)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    if (!updatedProfile) {
      return { success: false, error: "Không thể cập nhật role" };
    }

    return { success: true, data: updatedProfile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi thay đổi role" };
  }
} 