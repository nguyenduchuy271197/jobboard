"use server";

import { createClient } from "@/lib/supabase/server";
import type { DatabaseJobApplication } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

export async function getUserApplications(): Promise<{ 
  success: true; 
  data: DatabaseJobApplication[] 
} | { 
  success: false; 
  error: string 
}> {
  try {
    // 1. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 2. Fetch user applications
    const supabase = await createClient();
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
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    return {
      success: true,
      data: applications || [],
    };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 