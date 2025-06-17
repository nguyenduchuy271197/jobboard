"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const deleteLocationSchema = z.object({
  id: z.number().int().positive("ID địa điểm không hợp lệ"),
});

type DeleteLocationParams = z.infer<typeof deleteLocationSchema>;
type Result = 
  | { success: true } 
  | { success: false; error: string };

export async function deleteLocation(params: DeleteLocationParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = deleteLocationSchema.parse(params);

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
      return { success: false, error: "Chỉ admin mới có thể xóa địa điểm" };
    }

    // 4. Check if location exists
    const { data: existingLocation, error: existsError } = await supabase
      .from("locations")
      .select("id")
      .eq("id", data.id)
      .single();

    if (existsError) {
      return { success: false, error: "Địa điểm không tồn tại" };
    }

    if (!existingLocation) {
      return { success: false, error: "Địa điểm không tồn tại" };
    }

    // 5. Check if location is being used by companies or jobs
    const { data: companiesUsingLocation, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("location_id", data.id)
      .limit(1);

    if (companyCheckError) {
      return { success: false, error: companyCheckError.message };
    }

    if (companiesUsingLocation && companiesUsingLocation.length > 0) {
      return { success: false, error: "Không thể xóa địa điểm đang được sử dụng bởi công ty" };
    }

    const { data: jobsUsingLocation, error: jobCheckError } = await supabase
      .from("jobs")
      .select("id")
      .eq("location_id", data.id)
      .limit(1);

    if (jobCheckError) {
      return { success: false, error: jobCheckError.message };
    }

    if (jobsUsingLocation && jobsUsingLocation.length > 0) {
      return { success: false, error: "Không thể xóa địa điểm đang được sử dụng bởi việc làm" };
    }

    const { data: jobSeekerProfilesUsingLocation, error: profileCheckError } = await supabase
      .from("job_seeker_profiles")
      .select("id")
      .eq("preferred_location_id", data.id)
      .limit(1);

    if (profileCheckError) {
      return { success: false, error: profileCheckError.message };
    }

    if (jobSeekerProfilesUsingLocation && jobSeekerProfilesUsingLocation.length > 0) {
      return { success: false, error: "Không thể xóa địa điểm đang được sử dụng bởi hồ sơ ứng viên" };
    }

    // 6. Delete location
    const { error: deleteError } = await supabase
      .from("locations")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi xóa địa điểm" };
  }
} 