"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Location, LocationInsertDto } from "@/types/custom.types";

const createLocationSchema = z.object({
  name: z.string().min(1, "Tên địa điểm là bắt buộc").max(255, "Tên địa điểm không được quá 255 ký tự"),
  slug: z.string().min(1, "Slug là bắt buộc").max(255, "Slug không được quá 255 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
});

type CreateLocationParams = z.infer<typeof createLocationSchema>;
type Result = 
  | { success: true; data: Location } 
  | { success: false; error: string };

export async function createLocation(params: CreateLocationParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = createLocationSchema.parse(params);

    // 2. Create Supabase client and check auth
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Check if current user is admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    if (currentUserProfile?.role !== "admin") {
      return { success: false, error: "Chỉ admin mới có thể tạo địa điểm" };
    }

    // 4. Check if name or slug already exists
    const { data: existingLocation, error: checkError } = await supabase
      .from("locations")
      .select("id")
      .or(`name.eq.${data.name},slug.eq.${data.slug}`)
      .single();

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows found
      return { success: false, error: checkError.message };
    }

    if (existingLocation) {
      return { success: false, error: "Tên hoặc slug địa điểm đã tồn tại" };
    }

    // 5. Create location
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
      return { success: false, error: insertError.message };
    }

    if (!newLocation) {
      return { success: false, error: "Không thể tạo địa điểm" };
    }

    return { success: true, data: newLocation };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi tạo địa điểm" };
  }
} 