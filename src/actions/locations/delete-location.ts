"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAdminAuth } from "@/lib/auth-utils";

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

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check if location exists
    const supabase = await createClient();
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

    // 4. Check if location is being used by companies
    const { data: companiesUsingLocation, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("location_id", data.id)
      .limit(1);

    if (companyCheckError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (companiesUsingLocation && companiesUsingLocation.length > 0) {
      return { success: false, error: "Không thể xóa địa điểm đang được sử dụng bởi công ty" };
    }

    // 5. Check if location is being used by jobs
    const { data: jobsUsingLocation, error: jobCheckError } = await supabase
      .from("jobs")
      .select("id")
      .eq("location_id", data.id)
      .limit(1);

    if (jobCheckError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (jobsUsingLocation && jobsUsingLocation.length > 0) {
      return { success: false, error: "Không thể xóa địa điểm đang được sử dụng bởi việc làm" };
    }

    // 6. Check if location is being used by job seeker profiles
    const { data: jobSeekerProfilesUsingLocation, error: profileCheckError } = await supabase
      .from("job_seeker_profiles")
      .select("id")
      .eq("preferred_location_id", data.id)
      .limit(1);

    if (profileCheckError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (jobSeekerProfilesUsingLocation && jobSeekerProfilesUsingLocation.length > 0) {
      return { success: false, error: "Không thể xóa địa điểm đang được sử dụng bởi hồ sơ ứng viên" };
    }

    // 7. Delete location
    const { error: deleteError } = await supabase
      .from("locations")
      .delete()
      .eq("id", data.id);

    if (deleteError) {
      return { success: false, error: "Không thể xóa địa điểm" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 