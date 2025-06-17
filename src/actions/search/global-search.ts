"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { DatabaseJob, DatabaseCompany } from "@/types/custom.types";

const schema = z.object({
  query: z.string().trim().min(1, "Từ khóa tìm kiếm không được để trống"),
  limit: z.number().min(1).max(100).optional().default(20),
  type: z.enum(["all", "jobs", "companies"]).optional().default("all"),
});

export type GlobalSearchParams = z.infer<typeof schema>;

export type GlobalSearchResult = {
  jobs: Array<DatabaseJob>;
  companies: Array<DatabaseCompany>;
  total_count: number;
  jobs_count: number;
  companies_count: number;
};

type Result = 
  | { success: true; data: GlobalSearchResult }
  | { success: false; error: string };

export async function globalSearch(params: GlobalSearchParams): Promise<Result> {
  try {
    // Step 1: Validate input
    const data = schema.parse(params);

    // Step 2: Check authentication
    const authCheck = await checkAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();
    const searchQuery = `%${data.query}%`;
    
    let jobs: DatabaseJob[] = [];
    let companies: DatabaseCompany[] = [];

    // Step 3: Search jobs
    if (data.type === "all" || data.type === "jobs") {
      const { data: jobsData, error: jobsError } = await supabase
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
        `)
        .or(`title.ilike.${searchQuery},description.ilike.${searchQuery}`)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(data.type === "jobs" ? data.limit : Math.floor(data.limit / 2));

      if (jobsError) {
        return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
      }

      jobs = (jobsData || []) as DatabaseJob[];
    }

    // Step 4: Search companies
    if (data.type === "all" || data.type === "companies") {
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select(`
          *,
          industry:industries(id, name),
          location:locations(id, name)
        `)
        .or(`name.ilike.${searchQuery},description.ilike.${searchQuery}`)
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
        .limit(data.type === "companies" ? data.limit : Math.floor(data.limit / 2));

      if (companiesError) {
        return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
      }

      companies = (companiesData || []) as DatabaseCompany[];
    }

    const result: GlobalSearchResult = {
      jobs,
      companies,
      total_count: jobs.length + companies.length,
      jobs_count: jobs.length,
      companies_count: companies.length,
    };

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 