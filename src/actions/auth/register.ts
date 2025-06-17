"use server";

import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { UserRole, AuthUser, AuthSession } from "@/types/custom.types";

const registerSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL).transform(val => val.trim().toLowerCase()),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD).max(255, "Tên không được quá 255 ký tự").transform(val => val.trim()),
  role: z.enum(["job_seeker", "employer"] as const).default("job_seeker"),
});

type RegisterParams = z.infer<typeof registerSchema>;
type Result = 
  | { success: true; data: { user: AuthUser; session: AuthSession | null } } 
  | { success: false; error: string };

export async function registerUser(params: RegisterParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = registerSchema.parse(params);

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", data.email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (existingUser) {
      return { success: false, error: ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS };
    }

    // 4. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: data.role,
        },
      },
    });

    if (authError) {
      // Map common auth errors to user-friendly messages
      if (authError.message.includes("already registered")) {
        return { success: false, error: ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS };
      }
      if (authError.message.includes("weak password")) {
        return { success: false, error: "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn" };
      }
      return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
    }

    if (!authData.user) {
      return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
    }

    // 5. The profile will be automatically created by the trigger in the database
    // But we need to update the role since trigger uses default job_seeker
    if (authData.user.id && data.role !== "job_seeker") {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          role: data.role as UserRole,
          full_name: data.fullName 
        })
        .eq("id", authData.user.id);

      if (profileError) {
        // Don't fail registration if profile update fails, just log it
        console.error("Profile update error:", profileError);
      }
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