"use server";

import { createClient } from "@/lib/supabase/server";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const getCompaniesSchema = z.object({
  search: z.string().optional().transform(val => val?.trim()),
  industry_id: z.number().int().positive().optional(),
  location_id: z.number().int().positive().optional(),
  is_verified: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
}).optional();

type GetCompaniesParams = z.infer<typeof getCompaniesSchema>;
type Result = 
  | { success: true; data: Company[] } 
  | { success: false; error: string };

export async function getCompanies(params?: GetCompaniesParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getCompaniesSchema?.parse(params) || {};

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Build query
    let query = supabase
      .from("companies")
      .select(`
        *,
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .order("created_at", { ascending: false });

    // Apply search filter
    if (data?.search) {
      query = query.or(`name.ilike.%${data.search}%,description.ilike.%${data.search}%`);
    }

    // Apply industry filter
    if (data?.industry_id) {
      query = query.eq("industry_id", data.industry_id);
    }

    // Apply location filter
    if (data?.location_id) {
      query = query.eq("location_id", data.location_id);
    }

    // Apply verification filter
    if (data?.is_verified !== undefined) {
      query = query.eq("is_verified", data.is_verified);
    }

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