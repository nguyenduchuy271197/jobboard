"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import type { ExportUsersData } from "@/types/custom.types";

const schema = z.object({
  format: z.enum(["csv", "xlsx", "json"]),
  include_inactive: z.boolean().default(false),
  role_filter: z.enum(["job_seeker", "employer", "admin"]).optional(),
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

type Result = { 
  success: true; 
  data: {
    content: string;
    filename: string;
    mime_type: string;
  };
} | { 
  success: false; 
  error: string 
};

export async function exportUsers(params: ExportUsersData): Promise<Result> {
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
      .select(`
        *,
        job_seeker_profile:job_seeker_profiles(*),
        companies(*)
      `);

    // Step 4: Apply filters
    if (!data.include_inactive) {
      query = query.eq("is_active", true);
    }

    if (data.role_filter) {
      query = query.eq("role", data.role_filter);
    }

    if (data.date_range) {
      query = query
        .gte("created_at", data.date_range.start)
        .lte("created_at", data.date_range.end);
    }

    // Step 5: Execute query
    const { data: users, error } = await query.order("created_at", { ascending: false });

    if (error || !users) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    // Step 6: Prepare export data
    const exportData = users.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      is_active: user.is_active,
      phone: user.phone || '',
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at || '',
      companies_count: Array.isArray(user.companies) ? user.companies.length : 0,
      has_job_seeker_profile: !!user.job_seeker_profile,
    }));

    // Step 7: Format data based on requested format
    let content: string;
    let filename: string;
    let mimeType: string;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (data.format) {
      case 'csv':
        content = convertToCSV(exportData);
        filename = `users_export_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        filename = `users_export_${timestamp}.json`;
        mimeType = 'application/json';
        break;
      case 'xlsx':
        // For XLSX format, we would typically use a library like xlsx
        // For now, return CSV format as fallback
        content = convertToCSV(exportData);
        filename = `users_export_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        return { success: false, error: ERROR_MESSAGES.VALIDATION.INVALID_FORMAT };
    }

    return {
      success: true,
      data: {
        content,
        filename,
        mime_type: mimeType,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
}

function convertToCSV(data: Record<string, string | number | boolean>[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value);
      }).join(',')
    )
  ];

  return csvRows.join('\n');
} 