"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  company_id: z.number().positive(),
  reason: z.string().min(1, "Lý do từ chối là bắt buộc"),
});

type Result = 
  | { success: true }
  | { success: false; error: string };

export async function rejectCompany(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    const { company_id, reason } = schema.parse(params);

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
      .select("id, name, is_verified, owner_id")
      .eq("id", company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: "Không tìm thấy công ty" };
    }

    if (existingCompany.is_verified) {
      return { success: false, error: "Không thể từ chối công ty đã được xác minh" };
    }

    // 5. Update company to rejected status (keeping is_verified as false)
    const { error: updateError } = await supabase
      .from("companies")
      .update({
        is_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", company_id);

    if (updateError) {
      return { success: false, error: "Không thể từ chối công ty" };
    }

    // TODO: Send notification email to company owner with rejection reason
    // This would be implemented with email service integration
    console.log(`Company ${company_id} rejected. Reason: ${reason}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
} 