"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

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
    // 1. Validate input
    const { id: applicationId } = paramsSchema.parse({ id });

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Fetch application
    const supabase = await createClient();
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
        return { success: false, error: ERROR_MESSAGES.APPLICATION.NOT_FOUND };
      }
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (!application) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.NOT_FOUND };
    }

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID hồ sơ ứng tuyển không hợp lệ" };
    }
    
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 