"use server";

import { createClient } from "@/lib/supabase/server";
import type { DatabaseJobApplication } from "@/types/custom.types";

export async function getUserApplications(): Promise<{ 
  success: true; 
  data: DatabaseJobApplication[] 
} | { 
  success: false; 
  error: string 
}> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (
          *,
          company:companies (
            *,
            industry:industries (*),
            location:locations (*)
          )
        ),
        applicant:profiles!applications_applicant_id_fkey (
          *,
          job_seeker_profile:job_seeker_profiles (
            *,
            preferred_location:locations!job_seeker_profiles_preferred_location_id_fkey (*)
          )
        )
      `)
      .eq("applicant_id", user.id)
      .order("applied_at", { ascending: false });

    if (error) {
      console.error("Error fetching user applications:", error);
      return { success: false, error: "Không thể tải danh sách hồ sơ ứng tuyển của bạn" };
    }

    return {
      success: true,
      data: applications || [],
    };
  } catch (error) {
    console.error("Error in getUserApplications:", error);
    return { success: false, error: "Lỗi hệ thống" };
  }
} 