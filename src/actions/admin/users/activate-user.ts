"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";

const schema = z.object({
  user_id: z.string().uuid(),
});

type Result = { success: true } | { success: false; error: string };

export async function activateUser(params: { user_id: string }): Promise<Result> {
  try {
    // Step 1: Validate input
    const data = schema.parse(params);

    // Step 2: Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // Step 3: Check if target user exists
    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id, is_active")
      .eq("id", data.user_id)
      .single();

    if (userError || !targetUser) {
      return { success: false, error: ERROR_MESSAGES.USER.NOT_FOUND };
    }

    // Step 4: Check if user is already active
    if (targetUser.is_active) {
      return { success: false, error: ERROR_MESSAGES.USER.ALREADY_ACTIVE };
    }

    // Step 5: Activate user
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.user_id);

    if (updateError) {
      return { success: false, error: ERROR_MESSAGES.USER.ACTIVATION_FAILED };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: ERROR_MESSAGES.VALIDATION.INVALID_ID };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 