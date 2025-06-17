"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAdminAuth } from "@/lib/auth-utils";

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

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check if industry exists
    const supabase = await createClient();
    const { data: existingIndustry, error: existsError } = await supabase
      .from("industries")
      .select("id")
      .eq("id", data.id)
      .single();

    if (existsError || !existingIndustry) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.NOT_FOUND };
    }

    // 4. Check if industry is being used by companies
    const { data: companiesUsingIndustry, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("industry_id", data.id)
      .limit(1);

    if (companyCheckError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (companiesUsingIndustry && companiesUsingIndustry.length > 0) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.IN_USE_BY_COMPANIES };
    }

    // 5. Check if industry is being used by jobs
    const { data: jobsUsingIndustry, error: jobCheckError } = await supabase
      .from("jobs")
      .select("id")
      .eq("industry_id", data.id)
      .limit(1);

    if (jobCheckError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (jobsUsingIndustry && jobsUsingIndustry.length > 0) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.IN_USE_BY_JOBS };
    }

    // 6. Delete industry
    const { error: deleteError } = await supabase
      .from("industries")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.DELETE_FAILED };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 