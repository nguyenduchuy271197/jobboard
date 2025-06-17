"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJob, AdminJobsFilter } from "@/types/custom.types";

const schema = z.object({
  search: z.string().optional(),
  status: z.enum(["draft", "pending_approval", "published", "closed", "archived"]).optional(),
  company_id: z.number().optional(),
  industry_id: z.number().optional(),
  is_featured: z.boolean().optional(),
  created_after: z.string().optional(),
  created_before: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
}).optional();

type Result = { 
  success: true; 
  data: { 
    jobs: DatabaseJob[]; 
    total: number; 
    has_more: boolean; 
  } 
} | { 
  success: false; 
  error: string 
};

export async function getAllJobs(params?: AdminJobsFilter): Promise<Result> {
  try {
    const data = params ? schema.parse(params) : { limit: 20, offset: 0 };

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    // Kiểm tra quyền admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Bạn không có quyền truy cập chức năng này" };
    }

    // Build query
    let query = supabase
      .from("jobs")
      .select(`
        *,
        company:companies(id, name),
        industry:industries(id, name),
        location:locations(id, name)
      `, { count: "exact" });

    // Apply filters
    if (data?.search) {
      query = query.or(`title.ilike.%${data.search}%,description.ilike.%${data.search}%`);
    }

    if (data?.status) {
      query = query.eq("status", data.status);
    }

    if (data?.company_id) {
      query = query.eq("company_id", data.company_id);
    }

    if (data?.industry_id) {
      query = query.eq("industry_id", data.industry_id);
    }

    if (data?.created_after) {
      query = query.gte("created_at", data.created_after);
    }

    if (data?.created_before) {
      query = query.lte("created_at", data.created_before);
    }

    // Apply pagination
    const { data: jobs, error, count } = await query
      .order("created_at", { ascending: false })
      .range(data?.offset || 0, (data?.offset || 0) + (data?.limit || 20) - 1);

    if (error) {
      return { success: false, error: error.message };
    }

    const total = count || 0;
    const hasMore = (data?.offset || 0) + (data?.limit || 20) < total;

    return {
      success: true,
      data: {
        jobs: (jobs || []) as DatabaseJob[],
        total,
        has_more: hasMore,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy danh sách việc làm" };
  }
} 