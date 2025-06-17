"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const getUserCompaniesSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
}).optional();

type GetUserCompaniesParams = z.infer<typeof getUserCompaniesSchema>;
type Result = 
  | { success: true; data: Company[] } 
  | { success: false; error: string };

export async function getUserCompanies(params?: GetUserCompaniesParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getUserCompaniesSchema?.parse(params) || {};

    // 2. Check authentication and get profile
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;
    const supabase = await createClient();

    // 3. Build query
    let query = supabase
      .from("companies")
      .select(`
        *,
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    // Apply pagination
    if (data?.limit) {
      query = query.limit(data.limit);
    }
    if (data?.offset) {
      query = query.range(data.offset, data.offset + (data.limit || 50) - 1);
    }

    // 4. Execute query
    const { data: companies, error } = await query;

    if (error) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    return { success: true, data: companies || [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 