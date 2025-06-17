"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAuthWithProfile, checkCompanyAccess } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const updateCompanySchema = z.object({
  id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
  name: z.string().min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD).max(255, "Tên công ty không được quá 255 ký tự").transform(val => val.trim()).optional(),
  description: z.string().optional().transform(val => val?.trim()),
  website_url: z.string().url(ERROR_MESSAGES.VALIDATION.INVALID_URL).optional().or(z.literal("")).transform(val => val?.trim()),
  industry_id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID).optional(),
  location_id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID).optional(),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
  address: z.string().optional().transform(val => val?.trim()),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employee_count: z.number().int().min(0).optional(),
});

type UpdateCompanyParams = z.infer<typeof updateCompanySchema>;
type Result = 
  | { success: true; data: Company } 
  | { success: false; error: string };

export async function updateCompany(params: UpdateCompanyParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateCompanySchema.parse(params);

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

    // 5. Prepare update data (only include provided fields)
    const updateData: Partial<{
      name: string;
      description: string | null;
      website_url: string | null;
      industry_id: number | null;
      location_id: number | null;
      size: "startup" | "small" | "medium" | "large" | "enterprise" | null;
      address: string | null;
      founded_year: number | null;
      employee_count: number | null;
    }> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.website_url !== undefined) updateData.website_url = data.website_url || null;
    if (data.industry_id !== undefined) updateData.industry_id = data.industry_id;
    if (data.location_id !== undefined) updateData.location_id = data.location_id;
    if (data.size !== undefined) updateData.size = data.size;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.founded_year !== undefined) updateData.founded_year = data.founded_year;
    if (data.employee_count !== undefined) updateData.employee_count = data.employee_count;

    // 6. Update company
    const { data: company, error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", data.id)
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
      return { success: false, error: ERROR_MESSAGES.COMPANY.UPDATE_FAILED };
    }

    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 