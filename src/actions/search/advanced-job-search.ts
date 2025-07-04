"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { DatabaseJob, EmploymentType, ExperienceLevel } from "@/types/custom.types";

const schema = z.object({
  query: z.string().trim().optional(),
  industry_id: z.number().positive().optional(),
  location_id: z.number().positive().optional(),
  company_id: z.number().positive().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship", "freelance"]).optional(),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  is_remote: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  skills: z.array(z.string().trim()).optional(),
  posted_within_days: z.number().min(1).max(365).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sort_by: z.enum(["created_at", "salary_max", "applications_count", "views_count"]).optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type AdvancedJobSearchParams = z.infer<typeof schema>;

export type AdvancedJobSearchResult = {
  jobs: Array<DatabaseJob>;
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  filters_applied: {
    industry?: string;
    location?: string;
    company?: string;
    employment_type?: EmploymentType;
    experience_level?: ExperienceLevel;
    salary_range?: { min?: number; max?: number };
    is_remote?: boolean;
    is_featured?: boolean;
    skills_count?: number;
    posted_within_days?: number;
  };
};

type Result = 
  | { success: true; data: AdvancedJobSearchResult }
  | { success: false; error: string };

export async function advancedJobSearch(params: AdvancedJobSearchParams): Promise<Result> {
  try {
    // Step 1: Validate input
    const data = schema.parse(params);

    // Step 2: Check authentication
    const authCheck = await checkAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // Step 3: Calculate pagination offset
    const offset = (data.page - 1) * data.limit;

    // Step 4: Build base query
    let query = supabase
      .from("jobs")
      .select(`
        *,
        company:companies!inner(
          id,
          name,
          logo_url,
          is_verified,
          industry:industries(id, name),
          location:locations(id, name)
        ),
        industry:industries(id, name),
        location:locations(id, name)
      `, { count: "exact" })
      .eq("status", "published");

    // Step 5: Apply search filters
    if (data.query) {
      query = query.or(`title.ilike.%${data.query}%,description.ilike.%${data.query}%,requirements.ilike.%${data.query}%`);
    }

    if (data.industry_id) {
      query = query.eq("industry_id", data.industry_id);
    }

    if (data.location_id) {
      query = query.eq("location_id", data.location_id);
    }

    if (data.company_id) {
      query = query.eq("company_id", data.company_id);
    }

    if (data.employment_type) {
      query = query.eq("employment_type", data.employment_type);
    }

    if (data.experience_level) {
      query = query.eq("experience_level", data.experience_level);
    }

    if (data.salary_min) {
      query = query.gte("salary_min", data.salary_min);
    }

    if (data.salary_max) {
      query = query.lte("salary_max", data.salary_max);
    }

    if (data.is_remote !== undefined) {
      query = query.eq("is_remote", data.is_remote);
    }

    if (data.is_featured !== undefined) {
      query = query.eq("is_featured", data.is_featured);
    }

    if (data.skills && data.skills.length > 0) {
      query = query.overlaps("skills_required", data.skills);
    }

    if (data.posted_within_days) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - data.posted_within_days);
      query = query.gte("created_at", dateThreshold.toISOString());
    }

    // Step 6: Apply sorting and pagination
    query = query
      .order(data.sort_by, { ascending: data.sort_order === "asc" })
      .range(offset, offset + data.limit - 1);

    // Step 7: Execute query
    const { data: jobsData, error: jobsError, count } = await query;

    if (jobsError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / data.limit);

    // Step 8: Get filter names for display
    const filtersApplied: AdvancedJobSearchResult["filters_applied"] = {};

    if (data.industry_id) {
      const { data: industry } = await supabase
        .from("industries")
        .select("name")
        .eq("id", data.industry_id)
        .single();
      if (industry) filtersApplied.industry = industry.name;
    }

    if (data.location_id) {
      const { data: location } = await supabase
        .from("locations")
        .select("name")
        .eq("id", data.location_id)
        .single();
      if (location) filtersApplied.location = location.name;
    }

    if (data.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", data.company_id)
        .single();
      if (company) filtersApplied.company = company.name;
    }

    if (data.employment_type) {
      filtersApplied.employment_type = data.employment_type;
    }

    if (data.experience_level) {
      filtersApplied.experience_level = data.experience_level;
    }

    if (data.salary_min || data.salary_max) {
      filtersApplied.salary_range = {
        min: data.salary_min,
        max: data.salary_max,
      };
    }

    if (data.is_remote !== undefined) {
      filtersApplied.is_remote = data.is_remote;
    }

    if (data.is_featured !== undefined) {
      filtersApplied.is_featured = data.is_featured;
    }

    if (data.skills && data.skills.length > 0) {
      filtersApplied.skills_count = data.skills.length;
    }

    if (data.posted_within_days) {
      filtersApplied.posted_within_days = data.posted_within_days;
    }

    const result: AdvancedJobSearchResult = {
      jobs: (jobsData || []) as DatabaseJob[],
      total_count: totalCount,
      page: data.page,
      limit: data.limit,
      total_pages: totalPages,
      filters_applied: filtersApplied,
    };

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 