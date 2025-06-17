"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { 
  ExportReportData, 
  ReportDataItem,
  ApplicationReportItem,
  JobReportItem,
  CompanyReportItem,
  UserReportItem
} from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile, checkAdminAuth } from "@/lib/auth-utils";

const schema = z.object({
  report_type: z.enum(["applications", "jobs", "companies", "users"], {
    errorMap: () => ({ message: "Loại báo cáo không hợp lệ" }),
  }),
  format: z.enum(["csv", "json", "pdf"], {
    errorMap: () => ({ message: "Định dạng file không hợp lệ" }),
  }),
  date_range: z.object({
    start: z.string().refine(date => !isNaN(Date.parse(date)), "Ngày bắt đầu không hợp lệ"),
    end: z.string().refine(date => !isNaN(Date.parse(date)), "Ngày kết thúc không hợp lệ"),
  }).optional(),
  filters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  include_details: z.boolean().default(false),
});

type Result = 
  | { success: true; data: ExportReportData }
  | { success: false; error: string };

export async function exportReport(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    const validatedParams = schema.parse(params);

    // 2. Check authentication and get profile
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user, profile } = authCheck;

    // 3. Check permissions for users report (admin only)
    if (validatedParams.report_type === "users") {
      const adminCheck = await checkAdminAuth();
      if (!adminCheck.success) {
        return { success: false, error: ERROR_MESSAGES.AUTH.ADMIN_ONLY };
      }
    }

    // 4. Date range setup
    const now = new Date();
    const endDate = validatedParams.date_range?.end 
      ? new Date(validatedParams.date_range.end)
      : now;
    const startDate = validatedParams.date_range?.start 
      ? new Date(validatedParams.date_range.start)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 5. Get data based on report type
    let data: ReportDataItem[] = [];
    let fileName = "";

    const supabase = await createClient();

    switch (validatedParams.report_type) {
      case "applications":
        // For employers, only show their company's applications
        let applicationQuery = supabase
          .from("applications")
          .select(`
            id,
            applied_at,
            status,
            cover_letter,
            custom_cv_path,
            job:jobs(title, company:companies(name)),
            applicant:profiles!applicant_id(full_name, email)
          `)
          .gte("applied_at", startDate.toISOString())
          .lte("applied_at", endDate.toISOString())
          .order("applied_at", { ascending: false });

        if (profile.role === "employer") {
          const { data: userCompanies } = await supabase
            .from("companies")
            .select("id")
            .eq("owner_id", user.id);
          
          if (userCompanies && userCompanies.length > 0) {
            const companyIds = userCompanies.map(c => c.id);
            applicationQuery = applicationQuery.in("jobs.company_id", companyIds);
          } else {
            return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
          }
        }

        const { data: applications, error: appError } = await applicationQuery;
        if (appError) {
          return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
        }

        data = applications || [] as ApplicationReportItem[];
        fileName = `applications_report_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
        break;

      case "jobs":
        let jobQuery = supabase
          .from("jobs")
          .select(`
            id,
            title,
            description,
            status,
            created_at,
            updated_at,
            salary_min,
            salary_max,
            salary_currency,
            experience_level,
            employment_type,
            company:companies(name),
            location:locations(name),
            industry:industries(name),
            applications(id)
          `)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .order("created_at", { ascending: false });

        // For employers, only show their company's jobs
        if (profile.role === "employer") {
          const { data: userCompanies } = await supabase
            .from("companies")
            .select("id")
            .eq("owner_id", user.id);
          
          if (userCompanies && userCompanies.length > 0) {
            const companyIds = userCompanies.map(c => c.id);
            jobQuery = jobQuery.in("company_id", companyIds);
          } else {
            return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
          }
        }

        const { data: jobs, error: jobError } = await jobQuery;
        if (jobError) {
          return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
        }

        data = jobs || [] as JobReportItem[];
        fileName = `jobs_report_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
        break;

      case "companies":
        // Only admin can access all companies report
        if (profile.role === "employer") {
          const { data: userCompanies, error: companyError } = await supabase
            .from("companies")
            .select(`
              id,
              name,
              description,
              website_url,
              size,
              is_verified,
              created_at,
              updated_at,
              industry:industries(name),
              location:locations(name),
              jobs(id)
            `)
            .eq("owner_id", user.id)
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .order("created_at", { ascending: false });

          if (companyError) {
            return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
          }

          data = userCompanies || [] as CompanyReportItem[];
        } else {
          const { data: companies, error: companyError } = await supabase
            .from("companies")
            .select(`
              id,
              name,
              description,
              website_url,
              size,
              is_verified,
              created_at,
              updated_at,
              industry:industries(name),
              location:locations(name),
              jobs(id)
            `)
            .gte("created_at", startDate.toISOString())
            .lte("created_at", endDate.toISOString())
            .order("created_at", { ascending: false });

          if (companyError) {
            return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
          }

          data = companies || [] as CompanyReportItem[];
        }

        fileName = `companies_report_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
        break;

      case "users":
        const { data: users, error: userError } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            full_name,
            role,
            is_active,
            created_at,
            updated_at,
            job_seeker_profile:job_seeker_profiles(experience_level, is_looking_for_job),
            companies!owner_id(id, name)
          `)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .order("created_at", { ascending: false });

        if (userError) {
          return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
        }

        data = users || [] as UserReportItem[];
        fileName = `users_report_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
        break;
    }

    // 6. Apply additional filters if provided
    if (validatedParams.filters) {
      // This would need to be implemented based on specific filter requirements
      // For now, we'll skip additional filtering
    }

    // 7. Format data based on export format
    let fileContent = "";
    let mimeType = "";

    switch (validatedParams.format) {
      case "csv":
        fileContent = convertToCSV(data, validatedParams.report_type);
        mimeType = "text/csv";
        fileName += ".csv";
        break;

      case "json":
        fileContent = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        fileName += ".json";
        break;

      case "pdf":
        // For PDF, we would need a PDF generation library
        // For now, return a placeholder
        fileContent = "PDF generation not implemented yet";
        mimeType = "application/pdf";
        fileName += ".pdf";
        break;
    }

    return {
      success: true,
      data: {
        file_content: fileContent,
        file_name: fileName,
        mime_type: mimeType,
        total_records: data.length,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
}

function convertToCSV(data: ReportDataItem[], reportType: string): string {
  if (data.length === 0) return "";

  // Define headers based on report type
  let headers: string[] = [];
  
  switch (reportType) {
    case "applications":
      headers = [
        "ID",
        "Ngày ứng tuyển",
        "Trạng thái",
        "Tên công việc",
        "Tên công ty",
        "Tên ứng viên",
        "Email ứng viên",
        "Có thư xin việc",
        "Có CV",
      ];
      break;
    case "jobs":
      headers = [
        "ID",
        "Tiêu đề",
        "Trạng thái",
        "Ngày đăng",
        "Công ty",
        "Địa điểm",
        "Ngành nghề",
        "Mức lương tối thiểu",
        "Mức lương tối đa",
        "Kinh nghiệm",
        "Loại hình",
        "Số đơn ứng tuyển",
      ];
      break;
    case "companies":
      headers = [
        "ID",
        "Tên công ty",
        "Website",
        "Quy mô",
        "Trạng thái xác minh",
        "Ngày đăng ký",
        "Ngành nghề",
        "Địa điểm",
        "Số công việc đã đăng",
      ];
      break;
    case "users":
      headers = [
        "ID",
        "Email",
        "Họ tên",
        "Vai trò",
        "Trạng thái",
        "Ngày đăng ký",
        "Kinh nghiệm",
        "Đang tìm việc",
        "Số công ty sở hữu",
      ];
      break;
  }

  // Convert data to CSV rows
  const csvRows = [headers.join(",")];
  
  data.forEach(item => {
    let row: string[] = [];
    
    switch (reportType) {
      case "applications":
        const appItem = item as ApplicationReportItem;
        row = [
          appItem.id?.toString() || "",
          appItem.applied_at || "",
          appItem.status || "",
          appItem.job?.title || "",
          appItem.job?.company?.name || "",
          appItem.applicant?.full_name || "",
          appItem.applicant?.email || "",
          appItem.cover_letter ? "Có" : "Không",
          appItem.custom_cv_path ? "Có" : "Không",
        ];
        break;
      case "jobs":
        const jobItem = item as JobReportItem;
        row = [
          jobItem.id?.toString() || "",
          jobItem.title || "",
          jobItem.status || "",
          jobItem.created_at || "",
          jobItem.company?.name || "",
          jobItem.location?.name || "",
          jobItem.industry?.name || "",
          jobItem.salary_min?.toString() || "",
          jobItem.salary_max?.toString() || "",
          jobItem.experience_level || "",
          jobItem.employment_type || "",
          jobItem.applications?.length?.toString() || "0",
        ];
        break;
      case "companies":
        const companyItem = item as CompanyReportItem;
        row = [
          companyItem.id?.toString() || "",
          companyItem.name || "",
          companyItem.website_url || "",
          companyItem.size || "",
          companyItem.is_verified ? "Đã xác minh" : "Chưa xác minh",
          companyItem.created_at || "",
          companyItem.industry?.name || "",
          companyItem.location?.name || "",
          companyItem.jobs?.length?.toString() || "0",
        ];
        break;
      case "users":
        const userItem = item as UserReportItem;
        row = [
          userItem.id || "",
          userItem.email || "",
          userItem.full_name || "",
          userItem.role || "",
          userItem.is_active ? "Hoạt động" : "Không hoạt động",
          userItem.created_at || "",
          userItem.job_seeker_profile?.experience_level || "",
          userItem.job_seeker_profile?.is_looking_for_job ? "Có" : "Không",
          userItem.companies?.length?.toString() || "0",
        ];
        break;
    }
    
    // Escape commas and quotes in CSV data
    const escapedRow = row.map(field => {
      if (field.includes(",") || field.includes('"') || field.includes("\n")) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    });
    
    csvRows.push(escapedRow.join(","));
  });

  return csvRows.join("\n");
} 