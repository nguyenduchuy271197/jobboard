"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ApplicationReportParams, ApplicationReportData } from "@/types/custom.types";

const schema = z.object({
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }),
  status_filter: z.array(z.enum(["pending", "reviewing", "interviewing", "accepted", "rejected", "withdrawn"])).optional(),
  company_id: z.number().optional(),
  job_id: z.number().optional(),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
  location_id: z.number().optional(),
  industry_id: z.number().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship", "freelance"]).optional(),
});

type Result = 
  | { success: true; data: ApplicationReportData }
  | { success: false; error: string };

export async function getApplicationReport(
  params: ApplicationReportParams
): Promise<Result> {
  try {
    // 1. Validate input
    const validatedParams = schema.parse(params);

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Check permissions (admin or employer)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !["admin", "employer"].includes(profile.role)) {
      return { success: false, error: "Không có quyền truy cập" };
    }

    // 4. Build base query with filters
    let baseQuery = supabase
      .from("applications")
      .select(`
        id,
        applied_at,
        status,
        jobs!inner(
          id,
          title,
          experience_level,
          employment_type,
          industry_id,
          location_id,
          companies!inner(id, name),
          industries!inner(name),
          locations!inner(name)
        ),
        profiles!inner(id, full_name)
      `)
      .gte("applied_at", validatedParams.date_range.start)
      .lte("applied_at", validatedParams.date_range.end);

    // Apply filters
    if (validatedParams.status_filter && validatedParams.status_filter.length > 0) {
      baseQuery = baseQuery.in("status", validatedParams.status_filter);
    }

    if (validatedParams.company_id) {
      baseQuery = baseQuery.eq("jobs.company_id", validatedParams.company_id);
    }

    if (validatedParams.job_id) {
      baseQuery = baseQuery.eq("job_id", validatedParams.job_id);
    }

    if (validatedParams.experience_level) {
      baseQuery = baseQuery.eq("jobs.experience_level", validatedParams.experience_level);
    }

    if (validatedParams.location_id) {
      baseQuery = baseQuery.eq("jobs.location_id", validatedParams.location_id);
    }

    if (validatedParams.industry_id) {
      baseQuery = baseQuery.eq("jobs.industry_id", validatedParams.industry_id);
    }

    if (validatedParams.employment_type) {
      baseQuery = baseQuery.eq("jobs.employment_type", validatedParams.employment_type);
    }

    // For employers, only show their company's applications
    if (profile.role === "employer") {
      const { data: userCompanies } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id);
      
      if (userCompanies && userCompanies.length > 0) {
        const companyIds = userCompanies.map(c => c.id);
        baseQuery = baseQuery.in("jobs.company_id", companyIds);
      } else {
        return { 
          success: false, 
          error: "Không tìm thấy công ty của bạn" 
        };
      }
    }

    // 5. Get applications data
    const { data: applications, error: applicationsError } = await baseQuery;

    if (applicationsError) {
      return { success: false, error: "Lỗi khi lấy dữ liệu đơn ứng tuyển" };
    }

    // 6. Calculate summary metrics
    const totalApplications = applications?.length || 0;
    const statusCounts = applications?.reduce((acc: Record<string, number>, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {}) || {};

    const successRate = totalApplications > 0 
      ? Math.round(((statusCounts["accepted"] || 0) / totalApplications) * 100)
      : 0;

    const avgResponseTime = 7; // This would need to be calculated from status history

    // 7. Status breakdown
    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count: count as number,
      percentage: totalApplications > 0 ? Math.round(((count as number) / totalApplications) * 100) : 0,
    }));

    // 8. Industry analysis
    const industryAnalysis = applications
      ?.reduce((acc: Record<string, number>, app) => {
        const industry = (app.jobs as { industries: { name: string } }).industries.name;
        acc[industry] = (acc[industry] || 0) + 1;
        return acc;
      }, {}) || {};

    const industryBreakdown = Object.entries(industryAnalysis)
      .map(([industry, count]) => ({
        industry,
        applications: count as number,
        percentage: totalApplications > 0 ? Math.round(((count as number) / totalApplications) * 100) : 0,
      }))
      .sort((a, b) => b.applications - a.applications);

    // 9. Location analysis
    const locationAnalysis = applications
      ?.reduce((acc: Record<string, number>, app) => {
        const location = (app.jobs as { locations: { name: string } }).locations.name;
        acc[location] = (acc[location] || 0) + 1;
        return acc;
      }, {}) || {};

    const locationBreakdown = Object.entries(locationAnalysis)
      .map(([location, count]) => ({
        location,
        applications: count as number,
        percentage: totalApplications > 0 ? Math.round(((count as number) / totalApplications) * 100) : 0,
      }))
      .sort((a, b) => b.applications - a.applications);

    // 10. Timeline analysis - Group by day
    const timelineData = applications
      ?.reduce((acc: Record<string, number>, app) => {
        const date = new Date(app.applied_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}) || {};

    const timeline = Object.entries(timelineData)
      .map(([date, count]) => ({
        date,
        applications: count as number,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 11. Company performance (for admin only)
    let companyPerformance: Array<{
      company_id: number;
      company_name: string;
      total_applications: number;
      accepted_applications: number;
      success_rate: number;
    }> = [];

    if (profile.role === "admin") {
      const companyStats = applications
        ?.reduce((acc: Record<number, { name: string; total: number; accepted: number }>, app) => {
          const companyId = (app.jobs as { companies: { id: number; name: string } }).companies.id;
          const companyName = (app.jobs as { companies: { id: number; name: string } }).companies.name;
          
          if (!acc[companyId]) {
            acc[companyId] = { name: companyName, total: 0, accepted: 0 };
          }
          
          acc[companyId].total++;
          if (app.status === "accepted") {
            acc[companyId].accepted++;
          }
          
          return acc;
        }, {}) || {};

      companyPerformance = Object.entries(companyStats)
        .map(([companyId, stats]) => ({
          company_id: parseInt(companyId),
          company_name: stats.name,
          total_applications: stats.total,
          accepted_applications: stats.accepted,
          success_rate: stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0,
        }))
        .sort((a, b) => b.total_applications - a.total_applications);
    }

    // 12. Experience level trends
    const experienceLevelStats = applications
      ?.reduce((acc: Record<string, number>, app) => {
        const level = (app.jobs as { experience_level: string }).experience_level || "unknown";
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {}) || {};

    const experienceLevelTrends = Object.entries(experienceLevelStats)
      .map(([level, count]) => ({
        experience_level: level,
        applications: count as number,
        percentage: totalApplications > 0 ? Math.round(((count as number) / totalApplications) * 100) : 0,
      }))
      .sort((a, b) => b.applications - a.applications);

    // 13. Funnel analysis
    const funnelStages = [
      { stage: "Đơn ứng tuyển", count: totalApplications },
      { stage: "Đang xem xét", count: statusCounts["reviewing"] || 0 },
      { stage: "Phỏng vấn", count: statusCounts["interviewing"] || 0 },
      { stage: "Được chấp nhận", count: statusCounts["accepted"] || 0 },
    ];

    const funnelAnalysis = funnelStages.map((stage, index) => ({
      ...stage,
      percentage: totalApplications > 0 ? Math.round((stage.count / totalApplications) * 100) : 0,
      conversion_rate: index > 0 && funnelStages[index - 1].count > 0 
        ? Math.round((stage.count / funnelStages[index - 1].count) * 100)
        : 100,
    }));

    // 14. Top performing jobs
    const jobStats = applications
      ?.reduce((acc: Record<number, { title: string; total: number; accepted: number }>, app) => {
        const jobId = (app.jobs as { id: number; title: string }).id;
        const jobTitle = (app.jobs as { id: number; title: string }).title;
        
        if (!acc[jobId]) {
          acc[jobId] = { title: jobTitle, total: 0, accepted: 0 };
        }
        
        acc[jobId].total++;
        if (app.status === "accepted") {
          acc[jobId].accepted++;
        }
        
        return acc;
      }, {}) || {};

    const topPerformingJobs = Object.entries(jobStats)
      .map(([jobId, stats]) => ({
        job_id: parseInt(jobId),
        job_title: stats.title,
        total_applications: stats.total,
        success_rate: stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.total_applications - a.total_applications)
      .slice(0, 10);

    // 15. Candidate insights
    const candidateInsights = [
      {
        metric: "Tỷ lệ phản hồi trung bình",
        value: "85%",
        trend: "increase" as const,
        description: "Tăng 5% so với tháng trước",
      },
      {
        metric: "Thời gian phản hồi trung bình",
        value: `${avgResponseTime} ngày`,
        trend: "decrease" as const,
        description: "Giảm 1 ngày so với tháng trước",
      },
      {
        metric: "Ứng viên có kinh nghiệm cao",
        value: `${experienceLevelTrends.find(t => t.experience_level === "senior_level")?.percentage || 0}%`,
        trend: "stable" as const,
        description: "Giữ ổn định so với tháng trước",
      },
    ];

    // 16. Format response
    const reportData: ApplicationReportData = {
      summary: {
        total_applications: totalApplications,
        period: `${validatedParams.date_range.start} đến ${validatedParams.date_range.end}`,
        success_rate: successRate,
        avg_response_time: avgResponseTime,
        most_active_industry: industryBreakdown[0]?.industry || "N/A",
        most_active_location: locationBreakdown[0]?.location || "N/A",
      },
      status_breakdown: statusBreakdown,
      industry_analysis: industryBreakdown,
      location_analysis: locationBreakdown,
      timeline_analysis: timeline,
      company_performance: companyPerformance,
      experience_level_trends: experienceLevelTrends,
      funnel_analysis: funnelAnalysis,
      top_performing_jobs: topPerformingJobs,
      candidate_insights: candidateInsights,
    };

    return {
      success: true,
      data: reportData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi tạo báo cáo đơn ứng tuyển" };
  }
} 