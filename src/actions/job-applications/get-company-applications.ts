"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile, checkCompanyAccess } from "@/lib/auth-utils";

const paramsSchema = z.object({
  companyId: z.number().positive(),
}).strict();

export async function getCompanyApplications(
  companyId: number
): Promise<{ 
  success: true; 
  data: DatabaseJobApplication[] 
} | { 
  success: false; 
  error: string 
}> {
  try {
    // 1. Validate input
    const { companyId: validCompanyId } = paramsSchema.parse({ companyId });

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check company access
    const companyCheck = await checkCompanyAccess(validCompanyId);
    if (!companyCheck.success) {
      return { success: false, error: companyCheck.error };
    }

    // 4. Fetch applications
    const supabase = await createClient();
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (
          id,
          title,
          employment_type,
          experience_level,
          company_id
        ),
        applicant:profiles!applications_applicant_id_fkey (
          *,
          job_seeker_profile:job_seeker_profiles (
            *,
            preferred_location:locations!job_seeker_profiles_preferred_location_id_fkey (
              *
            )
          )
        )
      `)
      .eq("job.company_id", validCompanyId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    return {
      success: true,
      data: applications || [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID công ty không hợp lệ" };
    }
    
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 