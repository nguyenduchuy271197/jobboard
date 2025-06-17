"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";

type Result = 
  | { success: true } 
  | { success: false; error: string };

export async function logoutUser(): Promise<Result> {
  try {
    // 1. Check authentication (optional but good practice)
    const authCheck = await checkAuth();
    if (!authCheck.success) {
      // Already not authenticated, consider it a successful logout
      return { success: true };
    }

    // 2. Create Supabase client and sign out
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
    }

    return { success: true };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 