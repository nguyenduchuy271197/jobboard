"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const deleteCompanySchema = z.object({
  id: z.number().int().positive("ID công ty không hợp lệ"),
});

type DeleteCompanyParams = z.infer<typeof deleteCompanySchema>;
type Result = 
  | { success: true; data: { id: number } } 
  | { success: false; error: string };

export async function deleteCompany(params: DeleteCompanyParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = deleteCompanySchema.parse(params);

    // 2. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để xóa công ty" };
    }

    // 3. Check if company exists and user has permission
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, owner_id, name, logo_url")
      .eq("id", data.id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: "Công ty không tồn tại" };
    }

    if (existingCompany.owner_id !== user.id) {
      return { success: false, error: "Bạn không có quyền xóa công ty này" };
    }

    // 4. Check for dependencies (jobs using this company)
    const { count: jobCount, error: jobError } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", data.id);

    if (jobError) {
      return { success: false, error: "Lỗi khi kiểm tra jobs liên quan" };
    }

    if (jobCount && jobCount > 0) {
      return { 
        success: false, 
        error: `Không thể xóa công ty vì còn ${jobCount} việc làm đang liên kết` 
      };
    }

    // 5. Delete company logo from storage if exists
    if (existingCompany.logo_url) {
      const logoPath = existingCompany.logo_url.split('/').pop();
      if (logoPath) {
        await supabase.storage
          .from('company-logos')
          .remove([logoPath]);
      }
    }

    // 6. Delete company
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", data.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { id: data.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi xóa công ty" };
  }
} 