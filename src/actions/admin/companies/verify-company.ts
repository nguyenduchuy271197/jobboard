"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  company_id: z.number().positive(),
  notes: z.string().optional(),
});

type Result = 
  | { success: true }
  | { success: false; error: string };

export async function verifyCompany(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    const { company_id } = schema.parse(params);

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Check admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return { success: false, error: "Không có quyền truy cập" };
    }

    // 4. Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, name, is_verified")
      .eq("id", company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: "Không tìm thấy công ty" };
    }

    if (existingCompany.is_verified) {
      return { success: false, error: "Công ty đã được xác minh" };
    }

    // 5. Update company verification status
    const { error: updateError } = await supabase
      .from("companies")
      .update({
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", company_id);

    if (updateError) {
      return { success: false, error: "Không thể xác minh công ty" };
    }

    // TODO: Send notification email to company owner
    // This would be implemented with email service integration

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
} 