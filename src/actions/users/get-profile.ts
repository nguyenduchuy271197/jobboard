"use server";

import { Profile } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

type Result = 
  | { success: true; data: Profile } 
  | { success: false; error: string };

export async function getUserProfile(): Promise<Result> {
  try {
    // 1. Check authentication and get profile
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    return { success: true, data: authCheck.profile };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 