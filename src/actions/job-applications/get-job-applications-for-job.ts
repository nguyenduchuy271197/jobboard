"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

const paramsSchema = z.object({
  jobId: z.number().positive(),
}).strict();

export async function getJobApplicationsForJob(
  jobId: number
): Promise<{ 
  success: true; 
  data: DatabaseJobApplication[] 
} | { 
  success: false; 
  error: string 
}> {
  try {
    // 1. Validate input
    const { jobId: validJobId } = paramsSchema.parse({ jobId });

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Verify user owns the job or is authorized
    const supabase = await createClient();
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        id,
        company:companies (
          id,
          owner_id
        )
      `)
      .eq("id", validJobId)
      .single();

    if (jobError || !job) {
      return { success: false, error: ERROR_MESSAGES.JOB.NOT_FOUND };
    }

    // Check if user owns the company that posted the job
    if (job.company?.owner_id !== user.id) {
      return { success: false, error: ERROR_MESSAGES.JOB.UNAUTHORIZED_ACCESS };
    }

    // 4. Fetch applications
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (
          id,
          title,
          employment_type
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
      .eq("job_id", validJobId)
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
      return { success: false, error: "ID công việc không hợp lệ" };
    }
    
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 