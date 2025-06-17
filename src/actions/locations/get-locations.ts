"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Location } from "@/types/custom.types";

const getLocationsSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
}).optional();

type GetLocationsParams = z.infer<typeof getLocationsSchema>;
type Result = 
  | { success: true; data: Location[] } 
  | { success: false; error: string };

export async function getLocations(params?: GetLocationsParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getLocationsSchema?.parse(params) || {};

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Build query
    let query = supabase
      .from("locations")
      .select("*")
      .order("name", { ascending: true });

    // Apply search filter
    if (data?.search) {
      query = query.or(`name.ilike.%${data.search}%,slug.ilike.%${data.search}%`);
    }

    // Apply pagination
    if (data?.limit) {
      query = query.limit(data.limit);
    }
    if (data?.offset) {
      query = query.range(data.offset, data.offset + (data.limit || 50) - 1);
    }

    // 4. Execute query
    const { data: locations, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: locations || [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy danh sách địa điểm" };
  }
} 