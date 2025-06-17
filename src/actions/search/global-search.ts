"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { DatabaseJob, DatabaseCompany } from "@/types/custom.types";

const schema = z.object({
  query: z.string().min(1, "Từ khóa tìm kiếm không được để trống"),
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
    const data = schema.parse(params);
    const supabase = await createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để tìm kiếm" };
    }

    const searchQuery = `%${data.query}%`;
    
    let jobs: DatabaseJob[] = [];
    let companies: DatabaseCompany[] = [];

    // Tìm kiếm công việc
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
        return { success: false, error: "Lỗi khi tìm kiếm công việc" };
      }

      jobs = (jobsData || []) as DatabaseJob[];
    }

    // Tìm kiếm công ty
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
        return { success: false, error: "Lỗi khi tìm kiếm công ty" };
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
    return { success: false, error: "Lỗi hệ thống khi tìm kiếm" };
  }
} 