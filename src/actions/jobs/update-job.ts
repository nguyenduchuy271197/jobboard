"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Job } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile, checkCompanyAccess } from "@/lib/auth-utils";

const updateJobSchema = z.object({
  id: z.number().int().positive("ID việc làm không hợp lệ"),
  title: z.string()
    .min(1, "Tiêu đề việc làm không được để trống")
    .max(255, "Tiêu đề không được quá 255 ký tự")
    .trim()
    .optional(),
  description: z.string()
    .min(1, "Mô tả công việc không được để trống")
    .trim()
    .optional(),
  requirements: z.string()
    .min(1, "Yêu cầu công việc không được để trống")
    .trim()
    .optional(),
  industry_id: z.number().int().positive("ID ngành nghề không hợp lệ").optional(),
  location_id: z.number().int().positive("ID địa điểm không hợp lệ").optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "freelance", "internship"]).optional(),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
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

type UpdateJobParams = z.infer<typeof updateJobSchema>;
type Result = 
  | { success: true; data: Job } 
  | { success: false; error: string };

export async function updateJob(params: UpdateJobParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateJobSchema.parse(params);

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // 3. Check if job exists
    const supabase = await createClient();
    const { data: existingJob, error: jobError } = await supabase
      .from("jobs")
      .select("id, company_id")
      .eq("id", data.id)
      .single();

    if (jobError || !existingJob) {
      return { success: false, error: ERROR_MESSAGES.JOB.NOT_FOUND };
    }

    // 4. Check company access
    const companyCheck = await checkCompanyAccess(existingJob.company_id);
    if (!companyCheck.success) {
      return { success: false, error: companyCheck.error };
    }

    // 5. Validate industry exists (if provided)
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

    // 6. Validate location exists (if provided)
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

    // 7. Prepare update data (only include provided fields)
    const updateData: Partial<{
      title: string;
      description: string;
      requirements: string;
      industry_id: number | null;
      location_id: number | null;
      employment_type: "full_time" | "part_time" | "contract" | "freelance" | "internship";
      experience_level: "entry_level" | "mid_level" | "senior_level" | "executive";
      salary_min: number | null;
      salary_max: number | null;
      is_remote: boolean;
      application_deadline: string | null;
      status: "draft" | "pending_approval" | "published" | "closed" | "archived";
    }> = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.requirements !== undefined) updateData.requirements = data.requirements;
    if (data.industry_id !== undefined) updateData.industry_id = data.industry_id;
    if (data.location_id !== undefined) updateData.location_id = data.location_id;
    if (data.employment_type !== undefined) updateData.employment_type = data.employment_type;
    if (data.experience_level !== undefined) updateData.experience_level = data.experience_level;
    if (data.salary_min !== undefined) updateData.salary_min = data.salary_min;
    if (data.salary_max !== undefined) updateData.salary_max = data.salary_max;
    if (data.is_remote !== undefined) updateData.is_remote = data.is_remote;
    if (data.application_deadline !== undefined) updateData.application_deadline = data.application_deadline;
    if (data.status !== undefined) updateData.status = data.status;

    // 8. Update job
    const { data: job, error } = await supabase
      .from("jobs")
      .update(updateData)
      .eq("id", data.id)
      .select(`
        *,
        company:companies(id, name, logo_url, is_verified, website_url, description),
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .single();

    if (error) {
      return { success: false, error: ERROR_MESSAGES.JOB.UPDATE_FAILED };
    }

    return { success: true, data: job };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 