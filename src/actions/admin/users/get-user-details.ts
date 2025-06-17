"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import type { AdminUserDetails } from "@/types/custom.types";

const schema = z.object({
  user_id: z.string().uuid(),
});

type Result = { 
  success: true; 
  data: AdminUserDetails;
} | { 
  success: false; 
  error: string 
};

export async function getUserDetails(params: { user_id: string }): Promise<Result> {
  try {
    // Step 1: Validate input
    const data = schema.parse(params);

    // Step 2: Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // Step 3: Get user details with all relations
    const { data: userDetails, error } = await supabase
      .from("profiles")
      .select(`
        *,
        job_seeker_profile:job_seeker_profiles(
          *,
          preferred_location:locations(*)
        ),
        companies(*),
        jobs_count:jobs(count),
        applications_count:applications(count)
      `)
      .eq("id", data.user_id)
      .single();

    if (error) {
      return { success: false, error: ERROR_MESSAGES.USER.NOT_FOUND };
    }

    if (!userDetails) {
      return { success: false, error: ERROR_MESSAGES.USER.NOT_FOUND };
    }

    // Step 4: Format response data
    const result: AdminUserDetails = {
      ...userDetails,
      jobs_count: Array.isArray(userDetails.jobs_count) ? userDetails.jobs_count.length : 0,
      applications_count: Array.isArray(userDetails.applications_count) ? userDetails.applications_count.length : 0,
      last_login: userDetails.last_sign_in_at || undefined,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: ERROR_MESSAGES.VALIDATION.INVALID_ID };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 