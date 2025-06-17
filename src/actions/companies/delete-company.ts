"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAuthWithProfile, checkCompanyAccess } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";

const deleteCompanySchema = z.object({
  id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
});

type DeleteCompanyParams = z.infer<typeof deleteCompanySchema>;
type Result = 
  | { success: true; data: { id: number } } 
  | { success: false; error: string };

export async function deleteCompany(params: DeleteCompanyParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = deleteCompanySchema.parse(params);

    // 2. Check authentication and company access
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const accessCheck = await checkCompanyAccess(data.id);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    const supabase = await createClient();

    // 3. Get company details for cleanup
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, logo_url")
      .eq("id", data.id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
    }

    // 4. Check for dependencies (jobs using this company)
    const { count: jobCount, error: jobError } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("company_id", data.id);

    if (jobError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
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
      return { success: false, error: ERROR_MESSAGES.COMPANY.DELETE_FAILED };
    }

    return { success: true, data: { id: data.id } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 