"use server";

// import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";

const schema = z.object({
  name: z.string().trim().min(1, "Tên tìm kiếm không được để trống").max(100, "Tên tìm kiếm không được vượt quá 100 ký tự"),
  search_params: z.object({
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
  }),
  notification_enabled: z.boolean().optional().default(false),
});

export type SaveSearchParams = z.infer<typeof schema>;

export type SavedSearch = {
  id: number;
  user_id: string;
  name: string;
  search_params: SaveSearchParams["search_params"];
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
  last_checked_at: string | null;
  results_count: number | null;
};

type Result = 
  | { success: true; data: SavedSearch }
  | { success: false; error: string };

export async function saveSearch(params: SaveSearchParams): Promise<Result> {
  try {
    // Step 1: Validate input
    schema.parse(params);

    // Step 2: Check authentication
    const authCheck = await checkAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // Step 3: TODO - Implement saved searches table in database schema
    // When implementing, uncomment and modify the following:
    
    // const supabase = await createClient();
    
    // const { data: savedSearch, error } = await supabase
    //   .from("saved_searches")
    //   .insert({
    //     user_id: authCheck.user.id,
    //     name: data.name,
    //     search_params: data.search_params,
    //     notification_enabled: data.notification_enabled,
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString(),
    //   })
    //   .select()
    //   .single();
    
    // if (error) {
    //   if (error.code === "23505") { // Unique constraint violation
    //     return { success: false, error: "Tên tìm kiếm đã tồn tại" };
    //   }
    //   return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    // }
    
    // return { success: true, data: savedSearch };

    // For now, return feature not available error
    return { 
      success: false, 
      error: "Tính năng lưu tìm kiếm hiện tại chưa được triển khai. Sẽ có trong phiên bản tiếp theo." 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 