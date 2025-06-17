"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";

const paramsSchema = z.object({
  id: z.number().positive(),
}).strict();

export async function getJobApplication(
  id: number
): Promise<{ 
  success: true; 
  data: DatabaseJobApplication 
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

    const { id: applicationId } = paramsSchema.parse({ id });

    const { data: application, error } = await supabase
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
            industry:industries (*),
            preferred_location:locations!job_seeker_profiles_preferred_location_id_fkey (*)
          )
        )
      `)
      .eq("id", applicationId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Hồ sơ ứng tuyển không tồn tại" };
      }
      console.error("Error fetching job application:", error);
      return { success: false, error: "Không thể tải hồ sơ ứng tuyển" };
    }

    if (!application) {
      return { success: false, error: "Hồ sơ ứng tuyển không tồn tại" };
    }

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    console.error("Error in getJobApplication:", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID hồ sơ ứng tuyển không hợp lệ" };
    }
    
    return { success: false, error: "Lỗi hệ thống" };
  }
} 