"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Industry, IndustryInsertDto } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAdminAuth } from "@/lib/auth-utils";

const createIndustrySchema = z.object({
  name: z.string().min(1, "Tên ngành nghề là bắt buộc").max(255, "Tên ngành nghề không được quá 255 ký tự").trim(),
  description: z.string().max(1000, "Mô tả không được quá 1000 ký tự").trim().optional(),
  slug: z.string().min(1, "Slug là bắt buộc").max(255, "Slug không được quá 255 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang").trim(),
  is_active: z.boolean().optional().default(true),
});

type CreateIndustryParams = z.infer<typeof createIndustrySchema>;
type Result = 
  | { success: true; data: Industry } 
  | { success: false; error: string };

export async function createIndustry(params: CreateIndustryParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = createIndustrySchema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check if name or slug already exists
    const supabase = await createClient();
    const { data: existingIndustry, error: checkError } = await supabase
      .from("industries")
      .select("id")
      .or(`name.eq.${data.name},slug.eq.${data.slug}`)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows found
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (existingIndustry) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.ALREADY_EXISTS };
    }

    // 4. Create industry
    const insertData: IndustryInsertDto = {
      name: data.name,
      description: data.description,
      slug: data.slug,
      is_active: data.is_active,
    };

    const { data: newIndustry, error: insertError } = await supabase
      .from("industries")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.CREATE_FAILED };
    }

    if (!newIndustry) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.CREATE_FAILED };
    }

    return { success: true, data: newIndustry };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 