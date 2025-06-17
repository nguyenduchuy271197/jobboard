"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseCompany } from "@/types/custom.types";

const schema = z.object({
  search: z.string().optional(),
  industry_id: z.number().optional(),
  location_id: z.number().optional(),
  is_verified: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

type Result = 
  | { success: true; data: { companies: DatabaseCompany[]; total: number } }
  | { success: false; error: string };

export async function getAllCompanies(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    const validatedParams = schema.parse(params);

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Check admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return { success: false, error: "Không có quyền truy cập" };
    }

    // 4. Build query
    let query = supabase
      .from("companies")
      .select(`
        *,
        industry:industries(*),
        location:locations(*),
        owner:profiles!companies_owner_id_fkey(id, full_name, email)
      `, { count: "exact" });

    // Apply filters
    if (validatedParams.search) {
      query = query.ilike("name", `%${validatedParams.search}%`);
    }

    if (validatedParams.industry_id) {
      query = query.eq("industry_id", validatedParams.industry_id);
    }

    if (validatedParams.location_id) {
      query = query.eq("location_id", validatedParams.location_id);
    }

    if (validatedParams.is_verified !== undefined) {
      query = query.eq("is_verified", validatedParams.is_verified);
    }

    // Apply pagination and ordering
    const { data: companies, error: companiesError, count } = await query
      .order("created_at", { ascending: false })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

    if (companiesError) {
      return { success: false, error: "Không thể lấy danh sách công ty" };
    }

    return {
      success: true,
      data: {
        companies: companies as DatabaseCompany[],
        total: count || 0,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
} 