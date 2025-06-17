"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Location, LocationUpdateDto } from "@/types/custom.types";

const updateLocationSchema = z.object({
  id: z.number().int().positive("ID địa điểm không hợp lệ"),
  name: z.string().min(1, "Tên địa điểm là bắt buộc").max(255, "Tên địa điểm không được quá 255 ký tự").optional(),
  slug: z.string().min(1, "Slug là bắt buộc").max(255, "Slug không được quá 255 ký tự")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang").optional(),
});

type UpdateLocationParams = z.infer<typeof updateLocationSchema>;
type Result = 
  | { success: true; data: Location } 
  | { success: false; error: string };

export async function updateLocation(params: UpdateLocationParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateLocationSchema.parse(params);

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
      return { success: false, error: "Chỉ admin mới có thể cập nhật địa điểm" };
    }

    // 4. Check if location exists
    const { data: existingLocation, error: existsError } = await supabase
      .from("locations")
      .select("*")
      .eq("id", data.id)
      .single();

    if (existsError) {
      return { success: false, error: "Địa điểm không tồn tại" };
    }

    if (!existingLocation) {
      return { success: false, error: "Địa điểm không tồn tại" };
    }

    // 5. Check if new name or slug conflicts with other locations
    if (data.name || data.slug) {
      const conditions = [];
      if (data.name && data.name !== existingLocation.name) {
        conditions.push(`name.eq.${data.name}`);
      }
      if (data.slug && data.slug !== existingLocation.slug) {
        conditions.push(`slug.eq.${data.slug}`);
      }

      if (conditions.length > 0) {
        const { data: conflictLocation, error: checkError } = await supabase
          .from("locations")
          .select("id")
          .or(conditions.join(","))
          .neq("id", data.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          return { success: false, error: checkError.message };
        }

        if (conflictLocation) {
          return { success: false, error: "Tên hoặc slug địa điểm đã tồn tại" };
        }
      }
    }

    // 6. Update location
    const updateData: LocationUpdateDto = {
      ...(data.name && { name: data.name }),
      ...(data.slug && { slug: data.slug }),
      updated_at: new Date().toISOString(),
    };

    const { data: updatedLocation, error: updateError } = await supabase
      .from("locations")
      .update(updateData)
      .eq("id", data.id)
      .select()
      .single();

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    if (!updatedLocation) {
      return { success: false, error: "Không thể cập nhật địa điểm" };
    }

    return { success: true, data: updatedLocation };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi cập nhật địa điểm" };
  }
} 