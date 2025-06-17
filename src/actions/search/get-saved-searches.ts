"use server";

// import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { SavedSearch } from "./save-search";

const schema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(50).optional().default(20),
  sort_by: z.enum(["created_at", "updated_at", "name", "results_count"]).optional().default("created_at"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetSavedSearchesParams = Partial<z.infer<typeof schema>>;

export type GetSavedSearchesResult = {
  saved_searches: Array<SavedSearch & {
    has_new_results?: boolean;
    last_notification_sent?: string | null;
  }>;
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
};

type Result = 
  | { success: true; data: GetSavedSearchesResult }
  | { success: false; error: string };

export async function getSavedSearches(params?: GetSavedSearchesParams): Promise<Result> {
  try {
    // Step 1: Validate input
    const data = schema.parse(params || {});

    // Step 2: Check authentication
    const authCheck = await checkAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    // Step 3: TODO - Implement saved searches table in database schema
    // When implementing, uncomment and modify the following:
    
    // const supabase = await createClient();
    // const offset = (data.page - 1) * data.limit;
    
    // const { data: savedSearches, error, count } = await supabase
    //   .from("saved_searches")
    //   .select("*", { count: "exact" })
    //   .eq("user_id", authCheck.user.id)
    //   .order(data.sort_by, { ascending: data.sort_order === "asc" })
    //   .range(offset, offset + data.limit - 1);
    
    // if (error) {
    //   return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    // }

    // For now, return empty results
    return { 
      success: true, 
      data: {
        saved_searches: [],
        total_count: 0,
        page: data.page,
        limit: data.limit,
        total_pages: 0,
      }
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 