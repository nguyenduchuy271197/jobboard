"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { GeneralDashboardStats, ApplicationStatus } from "@/types/custom.types";

const schema = z.object({
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

type Result = 
  | { success: true; data: GeneralDashboardStats }
  | { success: false; error: string };

export async function getStats(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    schema.parse(params);

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 3. Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Không tìm thấy hồ sơ người dùng" };
    }

    // 4. Date ranges for calculations
    const now = new Date();
    // const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Not used yet
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 5. Get overview statistics
    const [
      , // totalUsersResult - not used in current response format
      totalJobsResult,
      totalCompaniesResult,
      totalApplicationsResult,
      activeJobsResult,
      , // recentJobsResult - not used in current response format
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase.from("jobs").select("id", { count: "exact" }),
      supabase.from("companies").select("id", { count: "exact" }),
      supabase.from("applications").select("id", { count: "exact" }),
      supabase.from("jobs").select("id", { count: "exact" }).eq("status", "published"),
      supabase.from("jobs").select("id", { count: "exact" }).gte("created_at", thisWeek.toISOString()),
    ]);

    // 6. Get growth metrics
    const [
      newUsersThisMonth,
      newJobsThisMonth,
      newApplicationsThisMonth,
      lastMonthUsers,
      lastMonthJobs,
      lastMonthApplications,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", currentMonth.toISOString()),
      supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .gte("created_at", currentMonth.toISOString()),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .gte("applied_at", currentMonth.toISOString()),
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", lastMonth.toISOString())
        .lt("created_at", currentMonth.toISOString()),
      supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .gte("created_at", lastMonth.toISOString())
        .lt("created_at", currentMonth.toISOString()),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .gte("applied_at", lastMonth.toISOString())
        .lt("applied_at", currentMonth.toISOString()),
    ]);

    // 7. Calculate growth rates
    const userGrowthRate = (lastMonthUsers.count || 0) > 0
      ? Math.round((((newUsersThisMonth.count || 0) - (lastMonthUsers.count || 0)) / (lastMonthUsers.count || 0)) * 100)
      : (newUsersThisMonth.count || 0) > 0 ? 100 : 0;

    const jobGrowthRate = (lastMonthJobs.count || 0) > 0
      ? Math.round((((newJobsThisMonth.count || 0) - (lastMonthJobs.count || 0)) / (lastMonthJobs.count || 0)) * 100)
      : (newJobsThisMonth.count || 0) > 0 ? 100 : 0;

    const applicationGrowthRate = (lastMonthApplications.count || 0) > 0
      ? Math.round((((newApplicationsThisMonth.count || 0) - (lastMonthApplications.count || 0)) / (lastMonthApplications.count || 0)) * 100)
      : (newApplicationsThisMonth.count || 0) > 0 ? 100 : 0;

    // 8. Get recent activity
    const [recentApplications, recentJobs, ] = await Promise.all([
      supabase
        .from("applications")
        .select(`
          id,
          applied_at,
          status,
          jobs!inner(title),
          applicant:profiles!applicant_id(full_name, avatar_url)
        `)
        .order("applied_at", { ascending: false })
        .limit(10),
      supabase
        .from("jobs")
        .select(`
          id,
          title,
          created_at,
          status,
          companies!inner(name, logo_url),
          locations!inner(name)
        `)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("companies")
        .select(`
          id,
          name,
          logo_url,
          jobs!inner(id)
        `)
        .eq("is_verified", true)
        .eq("jobs.status", "published")
        .then(result => ({
          data: result.data
            ?.reduce((acc: Array<{ company_id: number; company_name: string; logo_url?: string; job_count: number }>, company) => {
              const existing = acc.find(item => item.company_id === company.id);
              if (existing) {
                existing.job_count++;
              } else {
                acc.push({
                  company_id: company.id,
                  company_name: company.name,
                  logo_url: company.logo_url || undefined,
                  job_count: 1
                });
              }
              return acc;
            }, [])
            ?.sort((a, b) => b.job_count - a.job_count)
            ?.slice(0, 5) || [],
          error: result.error
        })),
    ]);

    // 9. Get performance indicators
    const [
      , // applicationSuccessRate - not used in current response format
      , // avgJobViews - not used in current response format
      activeJobSeekers,
      pendingApplications,
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("status")
        .then(result => {
          const applications = result.data || [];
          const total = applications.length;
          const successful = applications.filter(app => 
            app.status === "accepted" || app.status === "interviewing"
          ).length;
          return { rate: total > 0 ? Math.round((successful / total) * 100) : 0 };
        }),
      supabase
        .from("jobs")
        .select("views_count")
        .eq("status", "published")
        .then(result => ({
          avg: result.data?.length 
            ? Math.round(result.data.reduce((sum, job) => sum + (job.views_count || 0), 0) / result.data.length)
            : 0
        })),
      supabase
        .from("job_seeker_profiles")
        .select("user_id", { count: "exact" })
        .eq("is_looking_for_job", true),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("status", "pending"),
    ]);

    // 10. Get trending data - Popular industries
    const { data: popularIndustries } = await supabase
      .from("jobs")
      .select(`
        industry_id,
        industries!inner(name, slug)
      `)
      .eq("status", "published")
      .then(result => ({
        data: result.data
          ?.reduce((acc: Array<{ industry: string; count: number; slug: string }>, job) => {
            const industry = (job.industries as { name: string; slug: string }).name;
            const slug = (job.industries as { name: string; slug: string }).slug;
            const existing = acc.find(item => item.industry === industry);
            if (existing) {
              existing.count++;
            } else {
              acc.push({ industry, slug, count: 1 });
            }
            return acc;
          }, [])
          ?.sort((a, b) => b.count - a.count)
          ?.slice(0, 5) || [],
        error: result.error
      }));

    // 11. Get activity timeline for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const activityTimeline = await Promise.all(
      last7Days.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const [jobsResult, applicationsResult, usersResult] = await Promise.all([
          supabase
            .from("jobs")
            .select("id", { count: "exact" })
            .gte("created_at", date + "T00:00:00Z")
            .lt("created_at", nextDate.toISOString().split('T')[0] + "T00:00:00Z"),
          supabase
            .from("applications")
            .select("id", { count: "exact" })
            .gte("applied_at", date + "T00:00:00Z")
            .lt("applied_at", nextDate.toISOString().split('T')[0] + "T00:00:00Z"),
          supabase
            .from("profiles")
            .select("id", { count: "exact" })
            .gte("created_at", date + "T00:00:00Z")
            .lt("created_at", nextDate.toISOString().split('T')[0] + "T00:00:00Z"),
        ]);
        
        return {
          date,
          jobs_posted: jobsResult.count || 0,
          applications_submitted: applicationsResult.count || 0,
          new_users: usersResult.count || 0,
        };
      })
    );

    // 12. Format recent activities
    const formattedRecentApplications = recentApplications.data?.map(app => ({
      id: app.id,
      type: "application" as const,
      title: `Ứng tuyển cho "${(app.jobs as { title: string }).title}"`,
      user_name: (app.applicant as { full_name: string }).full_name || "Ẩn danh",
      user_avatar: (app.applicant as { avatar_url: string }).avatar_url || "",
      timestamp: app.applied_at,
      status: app.status,
    })) || [];

    const formattedRecentJobs = recentJobs.data?.slice(0, 5).map(job => ({
      id: job.id,
      type: "job_post" as const,
      title: `Tuyển dụng "${job.title}"`,
      company_name: (job.companies as { name: string }).name,
      company_logo: (job.companies as { logo_url: string }).logo_url || "",
      location: (job.locations as { name: string }).name,
      timestamp: job.created_at,
      status: job.status,
    })) || [];

    // Mix recent activities and sort by timestamp - not used in current response format
    // const recentActivity = [...formattedRecentApplications, ...formattedRecentJobs]
    //   .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    //   .slice(0, 10);

    // 13. Format response
    const generalStats: GeneralDashboardStats = {
      overview: {
        total_jobs: totalJobsResult.count || 0,
        total_companies: totalCompaniesResult.count || 0,
        total_job_seekers: activeJobSeekers.count || 0,
        total_applications: totalApplicationsResult.count || 0,
        active_jobs: activeJobsResult.count || 0,
        pending_applications: pendingApplications.count || 0,
        new_users_this_month: newUsersThisMonth.count || 0,
        jobs_filled_this_month: 0, // This would need to be calculated
      },
      growth: {
        jobs_growth: jobGrowthRate,
        companies_growth: 0, // This would need to be calculated
        applications_growth: applicationGrowthRate,
        users_growth: userGrowthRate,
      },
      recent_activity: {
        recent_jobs: formattedRecentJobs.slice(0, 5).map(job => ({
          id: job.id,
          title: job.title,
          company_name: job.company_name,
          created_at: job.timestamp,
          applications_count: 0, // This would need to be calculated
        })),
        recent_applications: formattedRecentApplications.slice(0, 5).map(app => ({
          id: app.id,
          job_title: app.title.replace('Ứng tuyển cho "', '').replace('"', ''),
          company_name: "", // This would need to be extracted from job data
          applicant_name: app.user_name,
          created_at: app.timestamp,
          status: app.status as ApplicationStatus,
        })),
        recent_companies: [], // This would need to be implemented
      },
      charts: {
        jobs_by_month: activityTimeline.map(activity => ({
          month: activity.date,
          count: activity.jobs_posted,
        })),
        applications_by_status: [
          { status: "pending", count: pendingApplications.count || 0 },
          { status: "accepted", count: 0 }, // This would need to be calculated
          { status: "rejected", count: 0 }, // This would need to be calculated
        ],
        companies_by_industry: popularIndustries?.map(industry => ({
          industry: industry.industry,
          count: industry.count,
        })) || [],
        top_locations: [], // This would need to be implemented
      },
    };

    return {
      success: true,
      data: generalStats,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy thống kê tổng quan" };
  }
} 