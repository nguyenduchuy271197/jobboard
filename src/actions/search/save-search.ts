"use server";

// import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// const schema = z.object({
//   name: z.string().min(1, "Tên tìm kiếm không được để trống").max(100, "Tên tìm kiếm không được vượt quá 100 ký tự"),
//   search_params: z.object({
//     query: z.string().optional(),
//     industry_id: z.number().optional(),
//     location_id: z.number().optional(),
//     company_id: z.number().optional(),
//     employment_type: z.enum(["full_time", "part_time", "contract", "internship", "freelance"]).optional(),
//     experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
//     salary_min: z.number().min(0).optional(),
//     salary_max: z.number().min(0).optional(),
//     is_remote: z.boolean().optional(),
//     is_featured: z.boolean().optional(),
//     skills: z.array(z.string()).optional(),
//     posted_within_days: z.number().min(1).max(365).optional(),
//   }),
//   notification_enabled: z.boolean().optional().default(false),
// });

export type SaveSearchParams = {
  name: string;
  search_params: {
    query?: string;
    industry_id?: number;
    location_id?: number;
    company_id?: number;
    employment_type?: "full_time" | "part_time" | "contract" | "internship" | "freelance";
    experience_level?: "entry_level" | "mid_level" | "senior_level" | "executive";
    salary_min?: number;
    salary_max?: number;
    is_remote?: boolean;
    is_featured?: boolean;
    skills?: string[];
    posted_within_days?: number;
  };
  notification_enabled?: boolean;
};

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

export async function saveSearch(/* _params: SaveSearchParams */): Promise<Result> {
  try {
    // TODO: Implement saved searches table in database schema
    // For now, return feature not available error
    return { 
      success: false, 
      error: "Tính năng lưu tìm kiếm hiện tại chưa được triển khai. Sẽ có trong phiên bản tiếp theo." 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Lỗi hệ thống khi lưu tìm kiếm" };
  }
} 