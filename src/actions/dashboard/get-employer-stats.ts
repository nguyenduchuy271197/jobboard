"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { EmployerDashboardStats, ApplicationStatus } from "@/types/custom.types";

const schema = z.object({
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

type Result = 
  | { success: true; data: EmployerDashboardStats }
  | { success: false; error: string };

export async function getEmployerStats(
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

    // 3. Check employer role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "employer") {
      return { success: false, error: "Không có quyền truy cập" };
    }

    // 4. Get employer's companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name, is_verified")
      .eq("owner_id", user.id);

    if (companiesError || !companies || companies.length === 0) {
      return { success: false, error: "Không tìm thấy công ty" };
    }

    const companyIds = companies.map(c => c.id);
    const mainCompany = companies[0];

    // 5. Date ranges for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1); // Not used yet

    // 6. Get company profile stats
    const [
      totalJobsResult,
      activeJobsResult,
      totalApplicationsResult,
      pendingApplicationsResult,
      , // viewsResult - not used yet
    ] = await Promise.all([
      supabase.from("jobs").select("id", { count: "exact" }).in("company_id", companyIds),
      supabase.from("jobs").select("id", { count: "exact" }).in("company_id", companyIds).eq("status", "published"),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("status", "pending")
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
      supabase
        .from("jobs")
        .select("views_count")
        .in("company_id", companyIds)
        .then(result => ({
          count: result.data?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0,
          error: result.error
        })),
    ]);

    // 7. Get hiring metrics
    const [
      , // newApplicationsToday - not used yet
      , // newApplicationsThisWeek - not used yet  
      newApplicationsThisMonth,
      newJobsThisMonth,
      interviewingApps,
      acceptedApps,
      , // rejectedApps - not used yet
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .gte("applied_at", today.toISOString())
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .gte("applied_at", thisWeek.toISOString())
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .gte("applied_at", currentMonth.toISOString())
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
      supabase
        .from("jobs")
        .select("id", { count: "exact" })
        .gte("created_at", currentMonth.toISOString())
        .in("company_id", companyIds),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("status", "interviewing")
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("status", "accepted")
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("status", "rejected")
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        ),
    ]);

    // 8. Get applications management data
    const [
      , // applicationsByStatus - not used yet
      recentApplications,
      , // topPerformingJobs - not used yet
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("status")
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        )
        .then(result => ({
          data: result.data?.reduce((acc: Record<string, number>, app) => {
            const status = app.status || 'unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {}),
          error: result.error
        })),
      supabase
        .from("applications")
        .select(`
          id,
          applied_at,
          status,
          jobs!inner(title),
          applicant:profiles!applicant_id(full_name, avatar_url)
        `)
        .in("job_id", 
          (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
        )
        .order("applied_at", { ascending: false })
        .limit(10),
      supabase
        .from("jobs")
        .select(`
          id,
          title,
          applications_count,
          views_count,
          published_at
        `)
        .in("company_id", companyIds)
        .eq("status", "published")
        .order("applications_count", { ascending: false })
        .limit(5),
    ]);

    // 9. Calculate job performance metrics - commented out for now
    // const jobPerformance = topPerformingJobs.data?.map(job => {
    //   const daysActive = job.published_at 
    //     ? Math.ceil((now.getTime() - new Date(job.published_at).getTime()) / (1000 * 60 * 60 * 24))
    //     : 0;
    //   
    //   return {
    //     job_id: job.id,
    //     job_title: job.title,
    //     applications: job.applications_count || 0,
    //     views: job.views_count || 0,
    //     conversion_rate: job.views_count && job.views_count > 0 
    //       ? Math.round(((job.applications_count || 0) / job.views_count) * 100)
    //       : 0,
    //     days_active: daysActive,
    //   };
    // }) || [];

    // 10. Get trending skills from job requirements - commented out for now
    // const { data: jobsWithSkills } = await supabase
    //   .from("jobs")
    //   .select("skills_required")
    //   .in("company_id", companyIds)
    //   .eq("status", "published")
    //   .not("skills_required", "is", null);

    // const skillsFrequency = jobsWithSkills
    //   ?.flatMap(job => job.skills_required || [])
    //   .reduce((acc: Record<string, number>, skill) => {
    //     const skillLower = skill.toLowerCase();
    //     acc[skillLower] = (acc[skillLower] || 0) + 1;
    //     return acc;
    //   }, {}) || {};

    // const trendingSkills = Object.entries(skillsFrequency)
    //   .sort(([,a], [,b]) => b - a)
    //   .slice(0, 10)
    //   .map(([skill, count]) => ({
    //     skill: skill.charAt(0).toUpperCase() + skill.slice(1),
    //     demand: count,
    //     growth: Math.floor(Math.random() * 20) + 5, // Mock growth percentage
    //   }));

    // 11. Get activity timeline for last 30 days - commented out for now
    // const last30Days = Array.from({ length: 30 }, (_, i) => {
    //   const date = new Date(now);
    //   date.setDate(date.getDate() - (29 - i));
    //   return date.toISOString().split('T')[0];
    // });

    // const activityTimeline = await Promise.all(
    //   last30Days.map(async (date) => {
    //     const nextDate = new Date(date);
    //     nextDate.setDate(nextDate.getDate() + 1);
    //     
    //     const [applicationsResult, viewsResult] = await Promise.all([
    //       supabase
    //         .from("applications")
    //         .select("id", { count: "exact" })
    //         .gte("applied_at", date + "T00:00:00Z")
    //         .lt("applied_at", nextDate.toISOString().split('T')[0] + "T00:00:00Z")
    //         .in("job_id", 
    //           (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
    //         ),
    //       // Note: Views tracking would need to be implemented separately
    //       // For now, we'll use a mock calculation based on applications
    //       Promise.resolve({ count: (Math.floor(Math.random() * 50) + 10) })
    //     ]);
    //     
    //     return {
    //       date,
    //       applications: applicationsResult.count || 0,
    //       views: viewsResult.count || 0,
    //     };
    //   })
    // );

    // 12. Calculate growth metrics - commented out for now
    // const lastMonthApplications = await supabase
    //   .from("applications")
    //   .select("id", { count: "exact" })
    //   .gte("applied_at", lastMonth.toISOString())
    //   .lt("applied_at", currentMonth.toISOString())
    //   .in("job_id", 
    //     (await supabase.from("jobs").select("id").in("company_id", companyIds)).data?.map(j => j.id) || []
    //   );

    const currentMonthApplications = newApplicationsThisMonth.count || 0;
    // const previousMonthApplications = lastMonthApplications.count || 0;
    // const growthRate = previousMonthApplications > 0 
    //   ? Math.round(((currentMonthApplications - previousMonthApplications) / previousMonthApplications) * 100)
    //   : currentMonthApplications > 0 ? 100 : 0;

    // 13. Format applications by status for response - commented out for now
    // const statusBreakdown = Object.entries(applicationsByStatus.data || {}).map(([status, count]) => ({
    //   status,
    //   count: count as number,
    //   percentage: totalApplicationsResult.count && totalApplicationsResult.count > 0
    //     ? Math.round(((count as number) / totalApplicationsResult.count) * 100)
    //     : 0,
    // }));

    // 14. Format recent applications
    const formattedRecentApplications = recentApplications.data?.map(app => ({
      application_id: app.id,
      candidate_name: (app.applicant as { full_name: string }).full_name || "Ẩn danh",
      candidate_avatar: (app.applicant as { avatar_url: string }).avatar_url || "",
      job_title: (app.jobs as { title: string }).title,
      applied_date: app.applied_at,
      status: app.status,
    })) || [];

    // 15. Format response
    const employerStats: EmployerDashboardStats = {
      company: {
        id: mainCompany.id,
        name: mainCompany.name,
        is_verified: mainCompany.is_verified,
        total_jobs_posted: totalJobsResult.count || 0,
        active_jobs: activeJobsResult.count || 0,
        draft_jobs: 0, // This would need draft status tracking
        archived_jobs: 0, // This would need archived status tracking
        total_applications_received: totalApplicationsResult.count || 0,
        profile_completion: 85, // This would need profile completion calculation
      },
      hiring: {
        jobs_posted_this_month: newJobsThisMonth.count || 0,
        applications_this_month: currentMonthApplications,
        interviews_scheduled: interviewingApps.count || 0,
        hires_made: acceptedApps.count || 0,
        avg_applications_per_job: totalJobsResult.count && totalJobsResult.count > 0
          ? Math.round((totalApplicationsResult.count || 0) / totalJobsResult.count)
          : 0,
        avg_time_to_hire: 14, // This would need detailed tracking
        fill_rate: totalJobsResult.count && totalJobsResult.count > 0
          ? Math.round(((acceptedApps.count || 0) / totalJobsResult.count) * 100)
          : 0,
      },
      applications: {
        pending_applications: pendingApplicationsResult.count || 0,
        shortlisted_candidates: 0, // This would need a shortlist system
        interviews_scheduled: interviewingApps.count || 0,
        offers_made: acceptedApps.count || 0,
        recent_applications: formattedRecentApplications.map(app => ({
          id: app.application_id,
          applicant_name: app.candidate_name,
          job_title: app.job_title,
          applied_at: app.applied_date,
          status: app.status as ApplicationStatus,
        })),
      },
    };

    return {
      success: true,
      data: employerStats,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy thống kê nhà tuyển dụng" };
  }
} 