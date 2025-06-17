"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Industry } from "@/types/custom.types";

const getIndustriesSchema = z.object({
  search: z.string().optional(),
  is_active: z.boolean().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
}).optional();

type GetIndustriesParams = z.infer<typeof getIndustriesSchema>;
type Result = 
  | { success: true; data: Industry[] } 
  | { success: false; error: string };

export async function getIndustries(params?: GetIndustriesParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getIndustriesSchema?.parse(params) || {};

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Build query
    let query = supabase
      .from("industries")
      .select("*")
      .order("name", { ascending: true });

    // Apply search filter
    if (data?.search) {
      query = query.or(`name.ilike.%${data.search}%,description.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    }

    // Apply active filter
    if (data?.is_active !== undefined) {
      query = query.eq("is_active", data.is_active);
    }

    // Apply pagination
    if (data?.limit) {
      query = query.limit(data.limit);
    }
    if (data?.offset) {
      query = query.range(data.offset, data.offset + (data.limit || 50) - 1);
    }

    // 4. Execute query
    const { data: industries, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: industries || [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy danh sách ngành nghề" };
  }
} 