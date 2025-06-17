"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Profile, ProfileUpdateDto } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, ERROR_MESSAGES.USER.INVALID_NAME)
    .optional(),
  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, ERROR_MESSAGES.USER.INVALID_PHONE)
    .nullable()
    .optional(),
});

type UpdateProfileParams = z.infer<typeof updateProfileSchema>;
type Result = 
  | { success: true; data: Profile } 
  | { success: false; error: string };

export async function updateUserProfile(params: UpdateProfileParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateProfileSchema.parse(params);

    // 2. Check authentication and get current profile
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Update profile
    const updateData: ProfileUpdateDto = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError || !updatedProfile) {
      return { success: false, error: ERROR_MESSAGES.USER.UPDATE_FAILED };
    }

    return { success: true, data: updatedProfile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 