"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJob } from "@/types/custom.types";

const schema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

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

export async function getPendingJobs(params?: { limit?: number; offset?: number }): Promise<Result> {
  try {
    const data = schema.parse(params || {});

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

    // Lấy danh sách jobs pending
    const { data: jobs, error, count } = await supabase
      .from("jobs")
      .select(`
        *,
        company:companies(*,
          industry:industries(*),
          location:locations(*)
        ),
        industry:industries(*),
        location:locations(*)
      `, { count: "exact" })
      .eq("status", "pending_approval")
      .order("created_at", { ascending: true })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) {
      return { success: false, error: "Không thể lấy danh sách công việc chờ duyệt" };
    }

    const total = count || 0;
    const hasMore = data.offset + data.limit < total;

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
    return { success: false, error: "Lỗi hệ thống" };
  }
} 