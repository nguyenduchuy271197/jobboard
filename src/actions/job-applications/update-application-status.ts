"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";

const updateStatusSchema = z.object({
  id: z.number().positive(),
  status: z.enum(["pending", "reviewing", "interviewing", "accepted", "rejected", "withdrawn"]),
  notes: z.string().max(1000).optional(),
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
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    const validatedData = updateStatusSchema.parse(data);

    // First, get the application and verify permissions
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
      return { success: false, error: "Hồ sơ ứng tuyển không tồn tại" };
    }

    // Check if user is authorized to update this application
    // Only the company owner can update application status
    if (application.job?.company?.owner_id !== user.id) {
      return { success: false, error: "Bạn không có quyền cập nhật trạng thái hồ sơ ứng tuyển này" };
    }

    // Update the application
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
      console.error("Error updating job application:", updateError);
      return { success: false, error: "Không thể cập nhật trạng thái hồ sơ ứng tuyển" };
    }

    if (!updatedApplication) {
      return { success: false, error: "Không thể cập nhật trạng thái hồ sơ ứng tuyển" };
    }

    return {
      success: true,
      data: updatedApplication,
    };
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        success: false, 
        error: `Dữ liệu không hợp lệ ${firstError.path.join(".")}: ${firstError.message}` 
      };
    }
    
    return { success: false, error: "Lỗi hệ thống" };
  }
} 