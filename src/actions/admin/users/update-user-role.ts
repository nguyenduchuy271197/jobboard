"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import type { UpdateUserRoleData } from "@/types/custom.types";

const schema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["job_seeker", "employer", "admin"]),
});

type Result = { success: true } | { success: false; error: string };

export async function updateUserRole(params: UpdateUserRoleData): Promise<Result> {
  try {
    // Step 1: Validate input
    const data = schema.parse(params);

    // Step 2: Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // Step 3: Prevent changing own role
    if (data.user_id === authCheck.user.id) {
      return { success: false, error: ERROR_MESSAGES.USER.CANNOT_CHANGE_OWN_ROLE };
    }

    const supabase = await createClient();

    // Step 4: Check if target user exists
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", data.user_id)
      .single();

    if (userError || !targetUser) {
      return { success: false, error: ERROR_MESSAGES.USER.NOT_FOUND };
    }

    // Step 5: Update user role
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user_id);

    if (updateError) {
      return { success: false, error: ERROR_MESSAGES.USER.UPDATE_FAILED };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: ERROR_MESSAGES.VALIDATION.INVALID_ID };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 