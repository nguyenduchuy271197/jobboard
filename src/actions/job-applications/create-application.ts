"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { CreateJobApplicationData, DatabaseJobApplication } from "@/types/custom.types";

const createApplicationSchema = z.object({
  job_id: z.number().positive(),
  cover_letter: z.string().min(1).max(2000).optional(),
}).strict();

export async function createApplication(
  data: CreateJobApplicationData
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

    const validatedData = createApplicationSchema.parse(data);

    // Check if user has a job seeker profile
    const { data: profile, error: profileError } = await supabase
      .from("job_seeker_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Bạn cần tạo hồ sơ ứng viên trước khi ứng tuyển" };
    }

    // Check if job exists and is active
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, title, status, company_id")
      .eq("id", validatedData.job_id)
      .single();

    if (jobError || !job) {
      return { success: false, error: "Công việc không tồn tại" };
    }

    if (job.status !== "published") {
      return { success: false, error: "Công việc này hiện không còn nhận hồ sơ ứng tuyển" };
    }

    // Check if user has already applied to this job
    const { data: existingApplication, error: existingError } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", validatedData.job_id)
      .eq("applicant_id", user.id)
      .single();

    if (existingApplication) {
      return { success: false, error: "Bạn đã ứng tuyển vị trí này rồi" };
    }

    // Ignore not found error for existing application check
    if (existingError && existingError.code !== "PGRST116") {
      console.error("Error checking existing application:", existingError);
      return { success: false, error: "Có lỗi khi kiểm tra hồ sơ ứng tuyển" };
    }

    // Create the application
    const { data: application, error: createError } = await supabase
      .from("applications")
      .insert({
        job_id: validatedData.job_id,
        applicant_id: user.id,
        cover_letter: validatedData.cover_letter,
        status: "pending",
      })
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

    if (createError) {
      console.error("Error creating job application:", createError);
      return { success: false, error: "Không thể tạo hồ sơ ứng tuyển" };
    }

    if (!application) {
      return { success: false, error: "Không thể tạo hồ sơ ứng tuyển" };
    }

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    console.error("Error in createApplication:", error);
    
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