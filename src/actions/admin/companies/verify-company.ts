"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";

const schema = z.object({
  company_id: z.number().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
  notes: z.string().optional().transform(val => val?.trim()),
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

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // 3. Check if company exists
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, name, is_verified")
      .eq("id", company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
    }

    if (existingCompany.is_verified) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.ALREADY_VERIFIED };
    }

    // 4. Update company verification status
    const { error: updateError } = await supabase
      .from("companies")
      .update({
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", company_id);

    if (updateError) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.UPDATE_FAILED };
    }

    // TODO: Send notification email to company owner
    // This would be implemented with email service integration

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 