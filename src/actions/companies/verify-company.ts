"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const verifyCompanySchema = z.object({
  company_id: z.number().int().positive("ID công ty không hợp lệ"),
  is_verified: z.boolean(),
});

type VerifyCompanyParams = z.infer<typeof verifyCompanySchema>;
type Result = 
  | { success: true; data: Company } 
  | { success: false; error: string };

export async function verifyCompany(params: VerifyCompanyParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = verifyCompanySchema.parse(params);

    // 2. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để xác thực công ty" };
    }

    // 3. Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Không thể xác thực quyền hạn của bạn" };
    }

    if (profile.role !== "admin") {
      return { success: false, error: "Bạn không có quyền xác thực công ty" };
    }

    // 4. Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, name, is_verified")
      .eq("id", data.company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: "Công ty không tồn tại" };
    }

    // 5. Update company verification status
    const { data: company, error } = await supabase
      .from("companies")
      .update({ is_verified: data.is_verified })
      .eq("id", data.company_id)
      .select(`
        *,
        industry:industries(id, name, slug),
        location:locations(id, name, slug),
        owner:profiles(id, full_name, email)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi xác thực công ty" };
  }
} 