"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { JobSeekerProfile } from "@/types/custom.types";

const getJobSeekerProfilesSchema = z.object({
  search: z.string().optional(),
  preferred_location_id: z.number().int().positive().optional(),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
  preferred_salary_min: z.number().min(0).optional(),
  preferred_salary_max: z.number().min(0).optional(),
  is_looking_for_job: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
}).optional();

type GetJobSeekerProfilesParams = z.infer<typeof getJobSeekerProfilesSchema>;
type Result = 
  | { success: true; data: JobSeekerProfile[] } 
  | { success: false; error: string };

export async function getJobSeekerProfiles(params?: GetJobSeekerProfilesParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getJobSeekerProfilesSchema?.parse(params) || {};

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Build query
    let query = supabase
      .from("job_seeker_profiles")
      .select(`
        *,
        preferred_location:locations(id, name, slug)
      `)
      .order("updated_at", { ascending: false });

    // Apply search filter (on headline, summary, skills)
    if (data?.search) {
      query = query.or(`headline.ilike.%${data.search}%,summary.ilike.%${data.search}%,skills.cs.{${data.search}}`);
    }

    // Apply location filter
    if (data?.preferred_location_id) {
      query = query.eq("preferred_location_id", data.preferred_location_id);
    }

    // Apply experience level filter
    if (data?.experience_level) {
      query = query.eq("experience_level", data.experience_level);
    }

    // Apply salary expectation filters
    if (data?.preferred_salary_min) {
      query = query.gte("preferred_salary_min", data.preferred_salary_min);
    }
    if (data?.preferred_salary_max) {
      query = query.lte("preferred_salary_max", data.preferred_salary_max);
    }

    // Apply availability filter
    if (data?.is_looking_for_job !== undefined) {
      query = query.eq("is_looking_for_job", data.is_looking_for_job);
    }

    // Apply pagination
    if (data?.limit) {
      query = query.limit(data.limit);
    }
    if (data?.offset) {
      query = query.range(data.offset, data.offset + (data.limit || 50) - 1);
    }

    // 4. Execute query
    const { data: profiles, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: profiles || [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy danh sách hồ sơ ứng viên" };
  }
} 