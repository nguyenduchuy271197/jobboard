"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

const updateStatusSchema = z.object({
  id: z.number().positive(),
  status: z.enum(["pending", "reviewing", "interviewing", "accepted", "rejected", "withdrawn"]),
  notes: z.string().max(1000).trim().optional(),
}).strict();

export async function updateApplicationStatus(
  data: { id: number; status: "pending" | "reviewing" | "interviewing" | "accepted" | "rejected" | "withdrawn"; notes?: string }
): Promise<{ 
  success: true; 
  data: DatabaseJobApplication 
} | { 
  success: false; 
  error: string 
}> {
  try {
    // 1. Validate input
    const validatedData = updateStatusSchema.parse(data);

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Get application and verify permissions
    const supabase = await createClient();
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        applicant_id,
        status,
        job:jobs (
          id,
          company:companies (
            id,
            owner_id
          )
        )
      `)
      .eq("id", validatedData.id)
      .single();

    if (appError || !application) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.NOT_FOUND };
    }

    // Check if user is authorized to update this application
    if (application.job?.company?.owner_id !== user.id) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.UNAUTHORIZED_STATUS_UPDATE };
    }

    // 4. Update the application
    const { data: updatedApplication, error: updateError } = await supabase
      .from("applications")
      .update({
        status: validatedData.status,
        notes: validatedData.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedData.id)
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
      .single();

    if (updateError) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.UPDATE_FAILED };
    }

    if (!updatedApplication) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.UPDATE_FAILED };
    }

    return {
      success: true,
      data: updatedApplication,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        success: false, 
        error: `Dữ liệu không hợp lệ ${firstError.path.join(".")}: ${firstError.message}` 
      };
    }
    
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 