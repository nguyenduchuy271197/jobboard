"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { JobApplicationsFilter, DatabaseJobApplication } from "@/types/custom.types";

const filtersSchema = z.object({
  job_id: z.number().optional(),
  company_id: z.number().optional(),
  status: z.enum(["pending", "reviewing", "interviewing", "accepted", "rejected", "withdrawn"]).optional(),
  applied_after: z.string().optional(),
  applied_before: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
}).strict();

export async function getJobApplications(
  filters: JobApplicationsFilter = {}
): Promise<{ 
  success: true; 
  data: { applications: DatabaseJobApplication[]; total: number } 
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

    const validatedFilters = filtersSchema.parse(filters);

    // Base query for applications with all necessary joins
    let query = supabase
      .from("applications")
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
      `, { count: 'exact' })
      .order("applied_at", { ascending: false });

    // Apply filters
    if (validatedFilters.job_id) {
      query = query.eq("job_id", validatedFilters.job_id);
    }

    if (validatedFilters.company_id) {
      query = query.eq("job.company_id", validatedFilters.company_id);
    }

    if (validatedFilters.status) {
      query = query.eq("status", validatedFilters.status);
    }

    if (validatedFilters.applied_after) {
      query = query.gte("applied_at", validatedFilters.applied_after);
    }

    if (validatedFilters.applied_before) {
      query = query.lte("applied_at", validatedFilters.applied_before);
    }

    // Execute query with pagination
    const { data: applications, error, count } = await query
      .range(validatedFilters.offset, validatedFilters.offset + validatedFilters.limit - 1);

    if (error) {
      console.error("Error fetching job applications:", error);
      return { success: false, error: "Không thể tải danh sách hồ sơ ứng tuyển" };
    }

    return {
      success: true,
      data: {
        applications: applications || [],
        total: count || 0,
      },
    };
  } catch (error) {
    console.error("Error in getJobApplications:", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: "Bộ lọc không hợp lệ" };
    }
    
    return { success: false, error: "Lỗi hệ thống" };
  }
} 