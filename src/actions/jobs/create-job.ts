"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Job } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile, checkCompanyAccess } from "@/lib/auth-utils";

const createJobSchema = z.object({
  company_id: z.number().int().positive("ID công ty không hợp lệ"),
  title: z.string()
    .min(1, "Tiêu đề việc làm không được để trống")
    .max(255, "Tiêu đề không được quá 255 ký tự")
    .trim(),
  description: z.string()
    .min(1, "Mô tả công việc không được để trống")
    .trim(),
  requirements: z.string()
    .min(1, "Yêu cầu công việc không được để trống")
    .trim(),
  industry_id: z.number().int().positive("ID ngành nghề không hợp lệ").optional(),
  location_id: z.number().int().positive("ID địa điểm không hợp lệ").optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "freelance", "internship"]),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]),
  salary_min: z.number().min(0, "Lương tối thiểu không hợp lệ").optional(),
  salary_max: z.number().min(0, "Lương tối đa không hợp lệ").optional(),
  is_remote: z.boolean().optional(),
  application_deadline: z.string().datetime("Hạn ứng tuyển không hợp lệ").optional(),
  status: z.enum(["draft", "pending_approval", "published", "closed", "archived"]).optional(),
}).refine((data) => {
  if (data.salary_min && data.salary_max) {
    return data.salary_min <= data.salary_max;
  }
  return true;
}, {
  message: "Lương tối thiểu không được lớn hơn lương tối đa",
  path: ["salary_max"],
});

type CreateJobParams = z.infer<typeof createJobSchema>;
type Result = 
  | { success: true; data: Job } 
  | { success: false; error: string };

export async function createJob(params: CreateJobParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = createJobSchema.parse(params);

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Check company access
    const companyCheck = await checkCompanyAccess(data.company_id);
    if (!companyCheck.success) {
      return { success: false, error: companyCheck.error };
    }

    // 4. Validate industry exists (if provided)
    const supabase = await createClient();
    if (data.industry_id) {
      const { data: industry, error: industryError } = await supabase
        .from("industries")
        .select("id")
        .eq("id", data.industry_id)
        .single();

      if (industryError || !industry) {
        return { success: false, error: "Ngành nghề không tồn tại" };
      }
    }

    // 5. Validate location exists (if provided)
    if (data.location_id) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .select("id")
        .eq("id", data.location_id)
        .single();

      if (locationError || !location) {
        return { success: false, error: "Địa điểm không tồn tại" };
      }
    }

    // 6. Create job
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        company_id: data.company_id,
        posted_by: user.id,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        industry_id: data.industry_id || null,
        location_id: data.location_id || null,
        employment_type: data.employment_type,
        experience_level: data.experience_level,
        salary_min: data.salary_min || null,
        salary_max: data.salary_max || null,
        is_remote: data.is_remote || false,
        application_deadline: data.application_deadline || null,
        status: data.status || "draft",
      })
      .select(`
        *,
        company:companies(id, name, logo_url, is_verified, website_url, description),
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .single();

    if (error) {
      return { success: false, error: ERROR_MESSAGES.JOB.CREATE_FAILED };
    }

    return { success: true, data: job };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 