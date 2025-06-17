"use server";

import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { AuthUser, AuthSession } from "@/types/custom.types";

const loginSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL).transform(val => val.trim().toLowerCase()),
  password: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD),
});

type LoginParams = z.infer<typeof loginSchema>;
type Result = 
  | { success: true; data: { user: AuthUser; session: AuthSession } } 
  | { success: false; error: string };

export async function loginUser(params: LoginParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = loginSchema.parse(params);

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Sign in with email and password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      // Map common auth errors to user-friendly messages
      if (authError.message.includes("Invalid login credentials")) {
        return { success: false, error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS };
      }
      if (authError.message.includes("Email not confirmed")) {
        return { success: false, error: ERROR_MESSAGES.AUTH.EMAIL_NOT_VERIFIED };
      }
      return { success: false, error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS };
    }

    if (!authData.user || !authData.session) {
      return { success: false, error: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS };
    }

    // 4. Update last sign in time in profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ last_sign_in_at: new Date().toISOString() })
      .eq("id", authData.user.id);

    if (profileError) {
      // Don't fail login if profile update fails, just log it
      console.error("Profile last sign in update error:", profileError);
    }

    return { 
      success: true, 
      data: { 
        user: authData.user, 
        session: authData.session 
      } 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 