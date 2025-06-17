"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Job } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";

const getCompanyJobsSchema = z.object({
  company_id: z.number().int().positive("ID công ty không hợp lệ"),
  status: z.enum(["draft", "pending_approval", "published", "closed", "archived"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

type GetCompanyJobsParams = z.infer<typeof getCompanyJobsSchema>;
type Result = 
  | { success: true; data: Job[] } 
  | { success: false; error: string };

export async function getCompanyJobs(params: GetCompanyJobsParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getCompanyJobsSchema.parse(params);

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Check if company exists
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", data.company_id)
      .single();

    if (companyError || !company) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
    }

    // 4. Build query
    let query = supabase
      .from("jobs")
      .select(`
        *,
        company:companies(id, name, logo_url, is_verified),
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .eq("company_id", data.company_id)
      .order("created_at", { ascending: false });

    // Apply status filter
    if (data.status) {
      query = query.eq("status", data.status);
    }

    // Apply pagination
    if (data.limit) {
      query = query.limit(data.limit);
    }
    if (data.offset) {
      query = query.range(data.offset, data.offset + (data.limit || 50) - 1);
    }

    // 5. Execute query
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