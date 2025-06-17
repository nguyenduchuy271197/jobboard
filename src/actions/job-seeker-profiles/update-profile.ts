"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { JobSeekerProfile } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

const updateProfileSchema = z.object({
  headline: z.string()
    .min(1, "Chức danh không được để trống")
    .max(255, "Chức danh không được quá 255 ký tự")
    .trim()
    .optional(),
  summary: z.string()
    .min(1, "Mô tả bản thân không được để trống")
    .trim()
    .optional(),
  skills: z.array(z.string().trim()).min(1, "Phải có ít nhất một kỹ năng").optional(),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
  preferred_location_id: z.number().int().positive("ID địa điểm không hợp lệ").optional(),
  preferred_salary_min: z.number().min(0, "Mức lương tối thiểu không hợp lệ").optional(),
  preferred_salary_max: z.number().min(0, "Mức lương tối đa không hợp lệ").optional(),
  is_looking_for_job: z.boolean().optional(),
  portfolio_url: z.string().url("URL portfolio không hợp lệ").optional().or(z.literal("")),
  linkedin_url: z.string().url("URL LinkedIn không hợp lệ").optional().or(z.literal("")),
  github_url: z.string().url("URL GitHub không hợp lệ").optional().or(z.literal("")),
}).refine((data) => {
  if (data.preferred_salary_min && data.preferred_salary_max) {
    return data.preferred_salary_min <= data.preferred_salary_max;
  }
  return true;
}, {
  message: "Mức lương tối thiểu không được lớn hơn mức lương tối đa",
  path: ["preferred_salary_max"],
});

type UpdateProfileParams = z.infer<typeof updateProfileSchema>;
type Result = 
  | { success: true; data: JobSeekerProfile } 
  | { success: false; error: string };

export async function updateJobSeekerProfile(params: UpdateProfileParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateProfileSchema.parse(params);

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Check if profile exists
    const supabase = await createClient();
    const { data: existingProfile, error: profileError } = await supabase
      .from("job_seeker_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !existingProfile) {
      return { success: false, error: "Hồ sơ ứng viên không tồn tại" };
    }

    // 4. Validate location exists (if provided)
    if (data.preferred_location_id) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .select("id")
        .eq("id", data.preferred_location_id)
        .single();

      if (locationError || !location) {
        return { success: false, error: "Địa điểm không tồn tại" };
      }
    }

    // 5. Prepare update data (only include provided fields)
    const updateData: Partial<{
      headline: string;
      summary: string;
      skills: string[];
      experience_level: "entry_level" | "mid_level" | "senior_level" | "executive";
      preferred_location_id: number | null;
      preferred_salary_min: number | null;
      preferred_salary_max: number | null;
      is_looking_for_job: boolean;
      portfolio_url: string | null;
      linkedin_url: string | null;
      github_url: string | null;
    }> = {};
    
    if (data.headline !== undefined) updateData.headline = data.headline;
    if (data.summary !== undefined) updateData.summary = data.summary;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.experience_level !== undefined) updateData.experience_level = data.experience_level;
    if (data.preferred_location_id !== undefined) updateData.preferred_location_id = data.preferred_location_id;
    if (data.preferred_salary_min !== undefined) updateData.preferred_salary_min = data.preferred_salary_min;
    if (data.preferred_salary_max !== undefined) updateData.preferred_salary_max = data.preferred_salary_max;
    if (data.is_looking_for_job !== undefined) updateData.is_looking_for_job = data.is_looking_for_job;
    if (data.portfolio_url !== undefined) updateData.portfolio_url = data.portfolio_url || null;
    if (data.linkedin_url !== undefined) updateData.linkedin_url = data.linkedin_url || null;
    if (data.github_url !== undefined) updateData.github_url = data.github_url || null;

    // 6. Update profile
    const { data: profile, error } = await supabase
      .from("job_seeker_profiles")
      .update(updateData)
      .eq("user_id", user.id)
      .select(`
        *,
        preferred_location:locations(id, name, slug)
      `)
      .single();

    if (error) {
      return { success: false, error: "Không thể cập nhật hồ sơ ứng viên" };
    }

    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 