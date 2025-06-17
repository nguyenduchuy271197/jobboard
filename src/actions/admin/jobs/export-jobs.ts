"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ExportJobsData } from "@/types/custom.types";

const schema = z.object({
  format: z.enum(["csv", "xlsx", "json"]),
  include_draft: z.boolean().default(false),
  include_archived: z.boolean().default(false),
  status_filter: z.enum(["draft", "pending_approval", "published", "closed", "archived"]).optional(),
  company_filter: z.number().optional(),
  industry_filter: z.number().optional(),
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

export async function exportJobs(params: ExportJobsData): Promise<Result> {
  try {
    const data = schema.parse(params);

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
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Build query
    let query = supabase
      .from("jobs")
      .select(`
        *,
        company:companies(name),
        industry:industries(name),
        location:locations(name)
      `);

    // Apply filters
    if (data.status_filter) {
      query = query.eq("status", data.status_filter);
    } else {
      // Default filtering
      const statuses: ("draft" | "pending_approval" | "published" | "closed" | "archived")[] = ["published"];
      if (data.include_draft) statuses.push("draft");
      if (data.include_archived) statuses.push("archived");
      query = query.in("status", statuses);
    }

    if (data.company_filter) {
      query = query.eq("company_id", data.company_filter);
    }

    if (data.industry_filter) {
      query = query.eq("industry_id", data.industry_filter);
    }

    if (data.date_range) {
      query = query
        .gte("created_at", data.date_range.start)
        .lte("created_at", data.date_range.end);
    }

    const { data: jobs, error } = await query.order("created_at", { ascending: false });

    if (error || !jobs) {
      return { success: false, error: "Không thể lấy dữ liệu công việc" };
    }

    // Prepare export data
    const exportData = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company_name: job.company?.name || '',
      industry_name: job.industry?.name || '',
      location_name: job.location?.name || '',
      employment_type: job.employment_type,
      experience_level: job.experience_level || '',
      status: job.status,
      is_remote: job.is_remote,
      salary_min: job.salary_min || 0,
      salary_max: job.salary_max || 0,
      salary_currency: job.salary_currency || '',
      application_deadline: job.application_deadline || '',
      created_at: job.created_at,
      updated_at: job.updated_at,
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    const timestamp = new Date().toISOString().split('T')[0];

    switch (data.format) {
      case 'csv':
        content = convertToCSV(exportData);
        filename = `jobs_export_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(exportData, null, 2);
        filename = `jobs_export_${timestamp}.json`;
        mimeType = 'application/json';
        break;
      case 'xlsx':
        // For XLSX format, we would typically use a library like xlsx
        // For now, return CSV format as fallback
        content = convertToCSV(exportData);
        filename = `jobs_export_${timestamp}.csv`;
        mimeType = 'text/csv';
        break;
      default:
        return { success: false, error: "Định dạng file không được hỗ trợ" };
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
    return { success: false, error: "Lỗi hệ thống" };
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