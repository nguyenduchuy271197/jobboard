"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Job } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";

const getJobsSchema = z.object({
  search: z.string().trim().optional(),
  company_id: z.number().int().positive().optional(),
  industry_id: z.number().int().positive().optional(),
  location_id: z.number().int().positive().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "freelance", "internship"]).optional(),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  is_remote: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  status: z.enum(["draft", "pending_approval", "published", "closed", "archived"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
}).optional();

type GetJobsParams = z.infer<typeof getJobsSchema>;
type Result = 
  | { success: true; data: Job[] } 
  | { success: false; error: string };

export async function getJobs(params?: GetJobsParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getJobsSchema?.parse(params) || {};

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Build query
    let query = supabase
      .from("jobs")
      .select(`
        *,
        company:companies(id, name, logo_url, is_verified),
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .order("created_at", { ascending: false });

    // Apply search filter
    if (data?.search) {
      query = query.or(`title.ilike.%${data.search}%,description.ilike.%${data.search}%,requirements.ilike.%${data.search}%`);
    }

    // Apply company filter
    if (data?.company_id) {
      query = query.eq("company_id", data.company_id);
    }

    // Apply industry filter
    if (data?.industry_id) {
      query = query.eq("industry_id", data.industry_id);
    }

    // Apply location filter
    if (data?.location_id) {
      query = query.eq("location_id", data.location_id);
    }

    // Apply employment type filter
    if (data?.employment_type) {
      query = query.eq("employment_type", data.employment_type);
    }

    // Apply experience level filter
    if (data?.experience_level) {
      query = query.eq("experience_level", data.experience_level);
    }

    // Apply salary range filters
    if (data?.salary_min) {
      query = query.gte("salary_min", data.salary_min);
    }
    if (data?.salary_max) {
      query = query.lte("salary_max", data.salary_max);
    }

    // Apply remote filter
    if (data?.is_remote !== undefined) {
      query = query.eq("is_remote", data.is_remote);
    }

    // Apply featured filter
    if (data?.is_featured !== undefined) {
      query = query.eq("is_featured", data.is_featured);
    }

    // Apply status filter (default to published for public access)
    if (data?.status) {
      query = query.eq("status", data.status);
    } else {
      query = query.eq("status", "published");
    }

    // Apply pagination
    if (data?.limit) {
      query = query.limit(data.limit);
    }
    if (data?.offset) {
      query = query.range(data.offset, data.offset + (data.limit || 50) - 1);
    }

    // 4. Execute query
    const { data: jobs, error } = await query;

    if (error) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    return { success: true, data: jobs || [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 