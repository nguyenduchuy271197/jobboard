"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";

const schema = z.object({
  format: z.enum(["csv", "json"]),
  include_unverified: z.boolean().default(false),
  industry_filter: z.number().optional(),
  location_filter: z.number().optional(),
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

type Result = 
  | { success: true; data: { content: string; filename: string; mimeType: string } }
  | { success: false; error: string };

export async function exportCompanies(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    const validatedParams = schema.parse(params);

    // 2. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;
    const supabase = await createClient();

    // 4. Build query
    let query = supabase
      .from("companies")
      .select(`
        *,
        industry:industries(name),
        location:locations(name),
        owner:profiles!companies_owner_id_fkey(id, full_name, email)
      `);

    // Apply filters
    if (!validatedParams.include_unverified) {
      query = query.eq("is_verified", true);
    }

    if (validatedParams.industry_filter) {
      query = query.eq("industry_id", validatedParams.industry_filter);
    }

    if (validatedParams.location_filter) {
      query = query.eq("location_id", validatedParams.location_filter);
    }

    if (validatedParams.date_range) {
      query = query
        .gte("created_at", validatedParams.date_range.start)
        .lte("created_at", validatedParams.date_range.end);
    }

    const { data: companies, error: companiesError } = await query
      .order("created_at", { ascending: false });

    if (companiesError) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (!companies || companies.length === 0) {
      return { success: false, error: "Không có dữ liệu để xuất" };
    }

    // 5. Process data for export
    const exportData = companies.map((company) => ({
      id: company.id,
      name: company.name,
      description: company.description || "",
      website_url: company.website_url || "",
      industry: company.industry?.name || "",
      location: company.location?.name || "",
      size: company.size || "",
      address: company.address || "",
      founded_year: company.founded_year || "",
      employee_count: company.employee_count || "",
      is_verified: company.is_verified ? "Đã xác minh" : "Chưa xác minh",
      owner_name: company.owner?.full_name || "",
      owner_email: company.owner?.email || "",
      created_at: new Date(company.created_at).toLocaleDateString("vi-VN"),
      updated_at: new Date(company.updated_at).toLocaleDateString("vi-VN"),
    }));

    // 6. Generate export content based on format
    let content: string;
    let filename: string;
    let mimeType: string;

    if (validatedParams.format === "csv") {
      // Generate CSV
      const headers = [
        "ID",
        "Tên công ty",
        "Mô tả",
        "Website",
        "Ngành nghề",
        "Địa điểm",
        "Quy mô",
        "Địa chỉ",
        "Năm thành lập",
        "Số nhân viên",
        "Trạng thái xác minh",
        "Tên chủ sở hữu",
        "Email chủ sở hữu",
        "Ngày tạo",
        "Ngày cập nhật",
      ];

      const csvRows = [
        headers.join(","),
        ...exportData.map(row => 
          Object.values(row).map(value => 
            typeof value === "string" && value.includes(",") 
              ? `"${value.replace(/"/g, '""')}"` 
              : value
          ).join(",")
        ),
      ];

      content = csvRows.join("\n");
      filename = `companies_export_${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else {
      // Generate JSON
      content = JSON.stringify({
        metadata: {
          exported_at: new Date().toISOString(),
          total_records: exportData.length,
          exported_by: user.id,
          filters: validatedParams,
        },
        data: exportData,
      }, null, 2);
      filename = `companies_export_${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }

    return {
      success: true,
      data: {
        content,
        filename,
        mimeType,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 