"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { JobSeekerProfile } from "@/types/custom.types";

const createProfileSchema = z.object({
  headline: z.string().min(1, "Chức danh không được để trống").max(255, "Chức danh không được quá 255 ký tự"),
  summary: z.string().min(1, "Mô tả bản thân không được để trống"),
  skills: z.array(z.string()).min(1, "Phải có ít nhất một kỹ năng"),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]),
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

type CreateProfileParams = z.infer<typeof createProfileSchema>;
type Result = 
  | { success: true; data: JobSeekerProfile } 
  | { success: false; error: string };

export async function createJobSeekerProfile(params: CreateProfileParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = createProfileSchema.parse(params);

    // 2. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để tạo hồ sơ" };
    }

    // 3. Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("job_seeker_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return { success: false, error: "Lỗi khi kiểm tra hồ sơ hiện tại" };
    }

    if (existingProfile) {
      return { success: false, error: "Bạn đã có hồ sơ ứng viên" };
    }

    // 4. Check if location exists (if provided)
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

    // 5. Create profile
    const { data: profile, error } = await supabase
      .from("job_seeker_profiles")
      .insert({
        user_id: user.id,
        headline: data.headline,
        summary: data.summary,
        skills: data.skills,
        experience_level: data.experience_level,
        preferred_location_id: data.preferred_location_id || null,
        preferred_salary_min: data.preferred_salary_min || null,
        preferred_salary_max: data.preferred_salary_max || null,
        is_looking_for_job: data.is_looking_for_job ?? true,
        portfolio_url: data.portfolio_url || null,
        linkedin_url: data.linkedin_url || null,
        github_url: data.github_url || null,
      })
      .select(`
        *,
        preferred_location:locations(id, name, slug)
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi tạo hồ sơ ứng viên" };
  }
} 