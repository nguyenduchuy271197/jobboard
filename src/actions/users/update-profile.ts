"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Profile, ProfileUpdateDto } from "@/types/custom.types";

const updateProfileSchema = z.object({
  full_name: z.string().min(1, "Tên đầy đủ là bắt buộc").optional(),
  phone: z.string().nullable().optional(),
});

type UpdateProfileParams = z.infer<typeof updateProfileSchema>;
type Result = 
  | { success: true; data: Profile } 
  | { success: false; error: string };

export async function updateUserProfile(params: UpdateProfileParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateProfileSchema.parse(params);

    // 2. Create Supabase client and check auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Update profile
    const updateData: ProfileUpdateDto = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    if (!updatedProfile) {
      return { success: false, error: "Không thể cập nhật profile" };
    }

    return { success: true, data: updatedProfile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi cập nhật profile" };
  }
} 