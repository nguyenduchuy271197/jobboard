"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Profile, UserRole } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAdminAuth } from "@/lib/auth-utils";

const changeRoleSchema = z.object({
  userId: z.string().uuid(ERROR_MESSAGES.VALIDATION.INVALID_UUID),
  newRole: z.enum(["job_seeker", "employer", "admin"] as const, {
    errorMap: () => ({ message: ERROR_MESSAGES.USER.INVALID_ROLE }),
  }),
});

type ChangeRoleParams = z.infer<typeof changeRoleSchema>;
type Result = 
  | { success: true; data: Profile } 
  | { success: false; error: string };

export async function changeUserRole(params: ChangeRoleParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = changeRoleSchema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user: currentUser } = authCheck;

    // 3. Prevent self-demotion safety check
    if (data.userId === currentUser.id && data.newRole !== "admin") {
      return { 
        success: false, 
        error: ERROR_MESSAGES.USER.CANNOT_CHANGE_OWN_ROLE 
      };
    }

    // 4. Check if target user exists
    const supabase = await createClient();
    const { data: targetUser, error: targetUserError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.userId)
      .single();

    if (targetUserError || !targetUser) {
      return { success: false, error: ERROR_MESSAGES.USER.NOT_FOUND };
    }

    // 5. Update user role
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({ 
        role: data.newRole as UserRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.userId)
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