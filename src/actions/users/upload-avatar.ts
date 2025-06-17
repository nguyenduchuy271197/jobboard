"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Profile } from "@/types/custom.types";

// Validate FormData fields
const uploadAvatarSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    "File quá lớn (tối đa 5MB)"
  ).refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Chỉ hỗ trợ file JPEG, PNG, hoặc WebP"
  ),
});

type Result = 
  | { success: true; data: { avatar_url: string; profile: Profile } } 
  | { success: false; error: string };

export async function uploadAvatar(formData: FormData): Promise<Result> {
  try {
    // 1. Extract and validate file from FormData
    const file = formData.get("file") as File;
    
    if (!file) {
      return { success: false, error: "Không tìm thấy file để upload" };
    }

    const validatedData = uploadAvatarSchema.parse({ file });

    // 2. Create Supabase client and check auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Create unique filename
    const fileExt = validatedData.file.name.split('.').pop();
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    // 4. Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, validatedData.file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    if (!urlData.publicUrl) {
      return { success: false, error: "Không thể tạo URL cho avatar" };
    }

    // 6. Update profile with new avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ 
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    if (!updatedProfile) {
      return { success: false, error: "Không thể cập nhật avatar trong profile" };
    }

    return { 
      success: true, 
      data: { 
        avatar_url: urlData.publicUrl,
        profile: updatedProfile 
      } 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi upload avatar" };
  }
} 