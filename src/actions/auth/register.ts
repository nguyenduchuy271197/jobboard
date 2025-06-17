"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { UserRole, AuthUser, AuthSession } from "@/types/custom.types";

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().min(1, "Tên đầy đủ là bắt buộc"),
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

    // 3. Sign up user with app_metadata containing role
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
        // Store role in app_metadata for RLS
        // Note: This might need to be handled differently depending on Supabase setup
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Không thể tạo tài khoản" };
    }

    // 4. The profile will be automatically created by the trigger in the database
    // But we need to update the role since trigger uses default job_seeker
    if (authData.user.id) {
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
    return { success: false, error: "Đã có lỗi xảy ra khi đăng ký" };
  }
} 