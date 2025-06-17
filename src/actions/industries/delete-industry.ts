"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const deleteIndustrySchema = z.object({
  id: z.number().int().positive("ID ngành nghề không hợp lệ"),
});

type DeleteIndustryParams = z.infer<typeof deleteIndustrySchema>;
type Result = 
  | { success: true } 
  | { success: false; error: string };

export async function deleteIndustry(params: DeleteIndustryParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = deleteIndustrySchema.parse(params);

    // 2. Create Supabase client and check auth
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // 3. Check if current user is admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    if (currentUserProfile?.role !== "admin") {
      return { success: false, error: "Chỉ admin mới có thể xóa ngành nghề" };
    }

    // 4. Check if industry exists
    const { data: existingIndustry, error: existsError } = await supabase
      .from("industries")
      .select("id")
      .eq("id", data.id)
      .single();

    if (existsError) {
      return { success: false, error: "Ngành nghề không tồn tại" };
    }

    if (!existingIndustry) {
      return { success: false, error: "Ngành nghề không tồn tại" };
    }

    // 5. Check if industry is being used by companies or jobs
    const { data: companiesUsingIndustry, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("industry_id", data.id)
      .limit(1);

    if (companyCheckError) {
      return { success: false, error: companyCheckError.message };
    }

    if (companiesUsingIndustry && companiesUsingIndustry.length > 0) {
      return { success: false, error: "Không thể xóa ngành nghề đang được sử dụng bởi công ty" };
    }

    const { data: jobsUsingIndustry, error: jobCheckError } = await supabase
      .from("jobs")
      .select("id")
      .eq("industry_id", data.id)
      .limit(1);

    if (jobCheckError) {
      return { success: false, error: jobCheckError.message };
    }

    if (jobsUsingIndustry && jobsUsingIndustry.length > 0) {
      return { success: false, error: "Không thể xóa ngành nghề đang được sử dụng bởi việc làm" };
    }

    // 6. Delete industry
    const { error: deleteError } = await supabase
      .from("industries")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi xóa ngành nghề" };
  }
} 