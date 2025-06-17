"use server";

import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const getCompanySchema = z.object({
  id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
});

type GetCompanyParams = z.infer<typeof getCompanySchema>;
type Result = 
  | { success: true; data: Company } 
  | { success: false; error: string };

export async function getCompanyDetails(params: GetCompanyParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getCompanySchema.parse(params);

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Execute query with relations
    const { data: company, error } = await supabase
      .from("companies")
      .select(`
        *,
        industry:industries(id, name, slug),
        location:locations(id, name, slug),
        owner:profiles(id, full_name, email)
      `)
      .eq("id", data.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
      }
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (!company) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
    }

    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 