"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import type { AdminUsersFilter, Profile } from "@/types/custom.types";

const schema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["job_seeker", "employer", "admin"]).optional(),
  is_active: z.boolean().optional(),
  created_after: z.string().optional(),
  created_before: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

type Result = { 
  success: true; 
  data: { 
    users: Profile[]; 
    total: number; 
    has_more: boolean; 
  } 
} | { 
  success: false; 
  error: string 
};

export async function getAllUsers(params: AdminUsersFilter): Promise<Result> {
  try {
    // Step 1: Validate input
    const data = schema.parse(params);

    // Step 2: Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // Step 3: Build query
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    // Step 4: Apply filters
    if (data.search) {
      query = query.or(`full_name.ilike.%${data.search}%,email.ilike.%${data.search}%`);
    }

    if (data.role) {
      query = query.eq("role", data.role);
    }

    if (data.is_active !== undefined) {
      query = query.eq("is_active", data.is_active);
    }

    if (data.created_after) {
      query = query.gte("created_at", data.created_after);
    }

    if (data.created_before) {
      query = query.lte("created_at", data.created_before);
    }

    // Step 5: Execute query with pagination
    query = query
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    return {
      success: true,
      data: {
        users: users || [],
        total: count || 0,
        has_more: (count || 0) > data.offset + data.limit,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 