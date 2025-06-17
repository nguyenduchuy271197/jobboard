"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Profile } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

// Validate FormData fields with enhanced validation
const uploadAvatarSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size > 0,
      ERROR_MESSAGES.FILE.INVALID_FILE
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      ERROR_MESSAGES.FILE.TOO_LARGE
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      ERROR_MESSAGES.FILE.INVALID_TYPE
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
      return { success: false, error: ERROR_MESSAGES.FILE.NOT_FOUND };
    }

    const validatedData = uploadAvatarSchema.parse({ file });

    // 2. Check authentication and get current profile
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Create unique filename
    const fileExt = validatedData.file.name.split('.').pop();
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    // 4. Upload file to Supabase Storage
    const supabase = await createClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, validatedData.file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: ERROR_MESSAGES.FILE.UPLOAD_FAILED };
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    if (!urlData.publicUrl) {
      return { success: false, error: ERROR_MESSAGES.FILE.UPLOAD_FAILED };
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

    if (updateError || !updatedProfile) {
      return { success: false, error: ERROR_MESSAGES.USER.UPDATE_FAILED };
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
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 