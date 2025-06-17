"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Location, LocationInsertDto } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAdminAuth } from "@/lib/auth-utils";

const createLocationSchema = z.object({
  name: z.string()
    .min(1, "Tên địa điểm là bắt buộc")
    .max(255, "Tên địa điểm không được quá 255 ký tự")
    .trim(),
  slug: z.string()
    .min(1, "Slug là bắt buộc")
    .max(255, "Slug không được quá 255 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang")
    .trim(),
});

type CreateLocationParams = z.infer<typeof createLocationSchema>;
type Result = 
  | { success: true; data: Location } 
  | { success: false; error: string };

export async function createLocation(params: CreateLocationParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = createLocationSchema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check if name or slug already exists
    const supabase = await createClient();
    const { data: existingLocation, error: checkError } = await supabase
      .from("locations")
      .select("id")
      .or(`name.eq.${data.name},slug.eq.${data.slug}`)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows found
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (existingLocation) {
      return { success: false, error: "Tên hoặc slug địa điểm đã tồn tại" };
    }

    // 4. Create location
    const insertData: LocationInsertDto = {
      name: data.name,
      slug: data.slug,
    };

    const { data: newLocation, error: insertError } = await supabase
      .from("locations")
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      return { success: false, error: "Không thể tạo địa điểm" };
    }

    if (!newLocation) {
      return { success: false, error: "Không thể tạo địa điểm" };
    }

    return { success: true, data: newLocation };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 