"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { JobPerformanceParams, JobPerformanceData } from "@/types/custom.types";

const schema = z.object({
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }),
  company_id: z.number().optional(),
  job_id: z.number().optional(),
  industry_id: z.number().optional(),
  location_id: z.number().optional(),
  employment_type: z.enum(["full_time", "part_time", "contract", "internship", "freelance"]).optional(),
  experience_level: z.enum(["entry_level", "mid_level", "senior_level", "executive"]).optional(),
});

type Result = 
  | { success: true; data: JobPerformanceData }
  | { success: false; error: string };

export async function getJobPerformance(
  params: JobPerformanceParams
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
      .from("jobs")
      .select(`
        id,
        title,
        created_at,
        published_at,
        status,
        views_count,
        applications_count,
        salary_min,
        salary_max,
        skills_required,
        employment_type,
        experience_level,
        companies!inner(id, name, logo_url),
        industries!inner(id, name),
        locations!inner(id, name),
        applications!inner(id, applied_at, status)
      `)
      .gte("created_at", validatedParams.date_range.start)
      .lte("created_at", validatedParams.date_range.end);

    // Apply filters
    if (validatedParams.company_id) {
      baseQuery = baseQuery.eq("company_id", validatedParams.company_id);
    }

    if (validatedParams.job_id) {
      baseQuery = baseQuery.eq("id", validatedParams.job_id);
    }

    if (validatedParams.industry_id) {
      baseQuery = baseQuery.eq("industry_id", validatedParams.industry_id);
    }

    if (validatedParams.location_id) {
      baseQuery = baseQuery.eq("location_id", validatedParams.location_id);
    }

    if (validatedParams.employment_type) {
      baseQuery = baseQuery.eq("employment_type", validatedParams.employment_type);
    }

    if (validatedParams.experience_level) {
      baseQuery = baseQuery.eq("experience_level", validatedParams.experience_level);
    }

    // For employers, only show their company's jobs
    if (profile.role === "employer") {
      const { data: userCompanies } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id);
      
      if (userCompanies && userCompanies.length > 0) {
        const companyIds = userCompanies.map(c => c.id);
        baseQuery = baseQuery.in("company_id", companyIds);
      } else {
        return { 
          success: false, 
          error: "Không tìm thấy công ty của bạn" 
        };
      }
    }

    // 5. Get jobs data
    const { data: jobs, error: jobsError } = await baseQuery;

    if (jobsError) {
      return { success: false, error: "Lỗi khi lấy dữ liệu công việc" };
    }

    // 6. Calculate overview metrics
    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter(job => job.status === "published").length || 0;
    const totalViews = jobs?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0;
    const totalApplications = jobs?.reduce((sum, job) => sum + (job.applications_count || 0), 0) || 0;
    
    const avgViewsPerJob = totalJobs > 0 ? Math.round(totalViews / totalJobs) : 0;
    const avgApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;
    const avgConversionRate = totalViews > 0 ? Math.round((totalApplications / totalViews) * 100) : 0;

    // 7. Calculate performance metrics per job
    const now = new Date();
    const jobPerformanceMetrics = jobs?.map(job => {
      const applications = (job.applications as Array<{ applied_at: string; status: string }>) || [];
      const viewsCount = job.views_count || 0;
      const applicationsCount = applications.length;
      
      const conversionRate = viewsCount > 0 ? Math.round((applicationsCount / viewsCount) * 100) : 0;
      
      const daysActive = job.published_at 
        ? Math.ceil((now.getTime() - new Date(job.published_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      const avgApplicationsPerDay = daysActive > 0 ? Math.round((applicationsCount / daysActive) * 10) / 10 : 0;
      
      const acceptedApplications = applications.filter(app => app.status === "accepted").length;
      const successRate = applicationsCount > 0 ? Math.round((acceptedApplications / applicationsCount) * 100) : 0;
      
      // Calculate quality score based on multiple factors
      const qualityScore = Math.min(100, Math.round(
        (conversionRate * 0.3) + 
        (successRate * 0.4) + 
        (Math.min(avgApplicationsPerDay * 10, 30) * 0.3)
      ));
      
      return {
        job_id: job.id,
        job_title: job.title,
        company_name: (job.companies as { name: string }).name,
        company_logo: (job.companies as { logo_url?: string }).logo_url,
        industry: (job.industries as { name: string }).name,
        location: (job.locations as { name: string }).name,
        employment_type: job.employment_type,
        experience_level: job.experience_level,
        published_date: job.published_at || job.created_at,
        status: job.status,
        views: viewsCount,
        applications: applicationsCount,
        conversion_rate: conversionRate,
        success_rate: successRate,
        avg_applications_per_day: avgApplicationsPerDay,
        days_active: daysActive,
        quality_score: qualityScore,
        salary_range: job.salary_min && job.salary_max 
          ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} VND`
          : "Thỏa thuận",
      };
    }) || [];

    // 8. Industry performance analysis
    const industryStats = jobs?.reduce((acc: Record<string, {
      jobs: number;
      views: number;
      applications: number;
      name: string;
    }>, job) => {
      const industryId = (job.industries as { id: number; name: string }).id;
      const industryName = (job.industries as { id: number; name: string }).name;
      
      if (!acc[industryId]) {
        acc[industryId] = { name: industryName, jobs: 0, views: 0, applications: 0 };
      }
      
      acc[industryId].jobs++;
      acc[industryId].views += job.views_count || 0;
      acc[industryId].applications += job.applications_count || 0;
      
      return acc;
    }, {}) || {};

    const industryPerformance = Object.entries(industryStats)
      .map(([industryId, stats]) => ({
        industry_id: parseInt(industryId),
        industry_name: stats.name,
        total_jobs: stats.jobs,
        total_views: stats.views,
        total_applications: stats.applications,
        avg_views_per_job: stats.jobs > 0 ? Math.round(stats.views / stats.jobs) : 0,
        avg_applications_per_job: stats.jobs > 0 ? Math.round(stats.applications / stats.jobs) : 0,
        conversion_rate: stats.views > 0 ? Math.round((stats.applications / stats.views) * 100) : 0,
      }))
      .sort((a, b) => b.total_applications - a.total_applications);

    // 9. Location performance analysis
    const locationStats = jobs?.reduce((acc: Record<string, {
      jobs: number;
      views: number;
      applications: number;
      name: string;
    }>, job) => {
      const locationId = (job.locations as { id: number; name: string }).id;
      const locationName = (job.locations as { id: number; name: string }).name;
      
      if (!acc[locationId]) {
        acc[locationId] = { name: locationName, jobs: 0, views: 0, applications: 0 };
      }
      
      acc[locationId].jobs++;
      acc[locationId].views += job.views_count || 0;
      acc[locationId].applications += job.applications_count || 0;
      
      return acc;
    }, {}) || {};

    const locationPerformance = Object.entries(locationStats)
      .map(([locationId, stats]) => ({
        location_id: parseInt(locationId),
        location_name: stats.name,
        total_jobs: stats.jobs,
        total_views: stats.views,
        total_applications: stats.applications,
        avg_views_per_job: stats.jobs > 0 ? Math.round(stats.views / stats.jobs) : 0,
        avg_applications_per_job: stats.jobs > 0 ? Math.round(stats.applications / stats.jobs) : 0,
        conversion_rate: stats.views > 0 ? Math.round((stats.applications / stats.views) * 100) : 0,
      }))
      .sort((a, b) => b.total_applications - a.total_applications);

    // 10. Trending skills analysis
    const allSkills = jobs?.flatMap(job => job.skills_required || []) || [];
    const skillsFrequency = allSkills.reduce((acc: Record<string, number>, skill) => {
      const skillLower = skill.toLowerCase();
      acc[skillLower] = (acc[skillLower] || 0) + 1;
      return acc;
    }, {});

    const trendingSkills = Object.entries(skillsFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([skill, demand]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        demand_count: demand as number,
        growth_rate: Math.floor(Math.random() * 40) - 10, // Mock growth rate
        avg_salary: 15000000 + Math.floor(Math.random() * 20000000), // Mock salary data
      }));

    // 11. Salary analysis by experience level
    const salaryAnalysis = jobs
      ?.filter(job => job.salary_min && job.salary_max)
      .reduce((acc: Record<string, { salaries: number[]; count: number }>, job) => {
        const level = job.experience_level || "unknown";
        const avgSalary = job.salary_min && job.salary_max 
          ? (job.salary_min + job.salary_max) / 2 
          : 0;
        
        if (!acc[level]) {
          acc[level] = { salaries: [], count: 0 };
        }
        
        acc[level].salaries.push(avgSalary);
        acc[level].count++;
        
        return acc;
      }, {}) || {};

    const salaryByExperience = Object.entries(salaryAnalysis)
      .map(([level, data]) => ({
        experience_level: level,
        job_count: data.count,
        avg_salary: data.salaries.length > 0 
          ? Math.round(data.salaries.reduce((sum, sal) => sum + sal, 0) / data.salaries.length)
          : 0,
        min_salary: data.salaries.length > 0 ? Math.min(...data.salaries) : 0,
        max_salary: data.salaries.length > 0 ? Math.max(...data.salaries) : 0,
      }))
      .sort((a, b) => b.avg_salary - a.avg_salary);

    // 12. Job lifecycle analysis
    const jobLifecycle = jobs
      ?.filter(job => job.published_at)
      .map(job => {
        const publishedDate = new Date(job.published_at!);
        const daysSincePublished = Math.ceil((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          job_id: job.id,
          job_title: job.title,
          published_date: job.published_at!,
          days_active: daysSincePublished,
          current_status: job.status,
          applications_received: job.applications_count || 0,
          views_received: job.views_count || 0,
          stage: daysSincePublished <= 7 ? "new" : 
                 daysSincePublished <= 30 ? "active" : 
                 daysSincePublished <= 60 ? "mature" : "aging",
        };
      })
      .sort((a, b) => b.applications_received - a.applications_received) || [];

    // 13. Top and bottom performing jobs
    const sortedJobs = [...jobPerformanceMetrics].sort((a, b) => b.quality_score - a.quality_score);
    const topPerformingJobs = sortedJobs.slice(0, 10);
    const bottomPerformingJobs = sortedJobs.slice(-5).reverse();

    // 14. Format response
    const performanceData: JobPerformanceData = {
      overview: {
        total_jobs: totalJobs,
        active_jobs: activeJobs,
        total_views: totalViews,
        total_applications: totalApplications,
        avg_views_per_job: avgViewsPerJob,
        avg_applications_per_job: avgApplicationsPerJob,
        overall_conversion_rate: avgConversionRate,
        period: `${validatedParams.date_range.start} đến ${validatedParams.date_range.end}`,
      },
      performance_metrics: jobPerformanceMetrics,
      industry_performance: industryPerformance,
      location_performance: locationPerformance,
      trending_skills: trendingSkills,
      salary_analysis: salaryByExperience,
      job_lifecycle: jobLifecycle,
      top_performing_jobs: topPerformingJobs,
      underperforming_jobs: bottomPerformingJobs,
    };

    return {
      success: true,
      data: performanceData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi tạo báo cáo hiệu suất công việc" };
  }
} 