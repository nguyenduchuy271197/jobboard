"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Industry, IndustryUpdateDto } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAdminAuth } from "@/lib/auth-utils";

const updateIndustrySchema = z.object({
  id: z.number().int().positive("ID ngành nghề không hợp lệ"),
  name: z.string().min(1, "Tên ngành nghề là bắt buộc").max(255, "Tên ngành nghề không được quá 255 ký tự").trim().optional(),
  description: z.string().max(1000, "Mô tả không được quá 1000 ký tự").trim().optional(),
  slug: z.string().min(1, "Slug là bắt buộc").max(255, "Slug không được quá 255 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang").trim().optional(),
  is_active: z.boolean().optional(),
});

type UpdateIndustryParams = z.infer<typeof updateIndustrySchema>;
type Result = 
  | { success: true; data: Industry } 
  | { success: false; error: string };

export async function updateIndustry(params: UpdateIndustryParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateIndustrySchema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check if industry exists
    const supabase = await createClient();
    const { data: existingIndustry, error: existsError } = await supabase
      .from("industries")
      .select("*")
      .eq("id", data.id)
      .single();

    if (existsError || !existingIndustry) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.NOT_FOUND };
    }

    // 4. Check if new name or slug conflicts with other industries
    if (data.name || data.slug) {
      const conditions = [];
      if (data.name && data.name !== existingIndustry.name) {
        conditions.push(`name.eq.${data.name}`);
      }
      if (data.slug && data.slug !== existingIndustry.slug) {
        conditions.push(`slug.eq.${data.slug}`);
      }

      if (conditions.length > 0) {
        const { data: conflictIndustry, error: checkError } = await supabase
          .from("industries")
          .select("id")
          .or(conditions.join(","))
          .neq("id", data.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
        }

        if (conflictIndustry) {
          return { success: false, error: ERROR_MESSAGES.INDUSTRY.ALREADY_EXISTS };
        }
      }
    }

    // 5. Update industry
    const updateData: IndustryUpdateDto = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.slug && { slug: data.slug }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedIndustry, error: updateError } = await supabase
      .from("industries")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.UPDATE_FAILED };
    }

    if (!updatedIndustry) {
      return { success: false, error: ERROR_MESSAGES.INDUSTRY.UPDATE_FAILED };
    }

    return { success: true, data: updatedIndustry };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 