"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const createCompanySchema = z.object({
  name: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD).max(255, "Tên công ty không được quá 255 ký tự").transform(val => val.trim()),
  description: z.string().optional().transform(val => val?.trim()),
  website_url: z.string().url(ERROR_MESSAGES.VALIDATION.INVALID_URL).optional().or(z.literal("")).transform(val => val?.trim()),
  industry_id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID).optional(),
  location_id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID).optional(),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
  address: z.string().optional().transform(val => val?.trim()),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employee_count: z.number().int().min(0).optional(),
});

type CreateCompanyParams = z.infer<typeof createCompanySchema>;
type Result = 
  | { success: true; data: Company } 
  | { success: false; error: string };

export async function createCompany(params: CreateCompanyParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = createCompanySchema.parse(params);

    // 2. Check authentication and get profile
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;
    const supabase = await createClient();

    // 3. Check if industry exists (if provided)
    if (data.industry_id) {
      const { data: industry, error: industryError } = await supabase
        .from("industries")
        .select("id")
        .eq("id", data.industry_id)
        .single();

      if (industryError || !industry) {
        return { success: false, error: ERROR_MESSAGES.INDUSTRY.NOT_FOUND };
      }
    }

    // 4. Check if location exists (if provided)
    if (data.location_id) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .select("id")
        .eq("id", data.location_id)
        .single();

      if (locationError || !location) {
        return { success: false, error: ERROR_MESSAGES.LOCATION.NOT_FOUND };
      }
    }

    // 5. Create company
    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        owner_id: user.id,
        name: data.name,
        description: data.description || null,
        website_url: data.website_url || null,
        industry_id: data.industry_id || null,
        location_id: data.location_id || null,
        size: data.size || null,
        address: data.address || null,
        founded_year: data.founded_year || null,
        employee_count: data.employee_count || null,
        is_verified: false,
      })
      .select(`
        *,
        industry:industries(id, name, slug),
        location:locations(id, name, slug),
        owner:profiles(id, full_name, email)
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: ERROR_MESSAGES.COMPANY.ALREADY_EXISTS };
      }
      return { success: false, error: ERROR_MESSAGES.COMPANY.CREATE_FAILED };
    }

    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 