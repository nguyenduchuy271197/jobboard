"use server";

import { createClient } from "@/lib/supabase/server";
import { 
  JobSeekerDashboardStats, 
  EmployerDashboardStats, 
  AdminDashboardStats,
  Profile 
} from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

type DashboardStats = JobSeekerDashboardStats | EmployerDashboardStats | AdminDashboardStats;
type Result = 
  | { success: true; data: DashboardStats } 
  | { success: false; error: string };

export async function getDashboardStats(): Promise<Result> {
  try {
    // 1. Check authentication and get current profile
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { profile } = authCheck;

    // 2. Get stats based on user role
    switch (profile.role) {
      case "job_seeker":
        return await getJobSeekerStats(profile);
      case "employer":
        return await getEmployerStats(profile);
      case "admin":
        return await getAdminStats();
      default:
        return { success: false, error: ERROR_MESSAGES.AUTH.UNAUTHORIZED };
    }
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
}

async function getJobSeekerStats(profile: Profile): Promise<Result> {
  const supabase = await createClient();

  try {
    // Get application stats for job seeker
    const { data: applications, error: applicationsError } = await supabase
      .from("applications")
      .select("id, status, applied_at")
      .eq("applicant_id", profile.id);

    if (applicationsError) {
      return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
    }

    // Get job seeker profile stats
    const { data: jobSeekerProfile } = await supabase
      .from("job_seeker_profiles")
      .select("*")
      .eq("user_id", profile.id)
      .single();

    const totalApplications = applications?.length || 0;
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const applicationsThisMonth = applications?.filter(app => 
      new Date(app.applied_at) > thisMonth
    ).length || 0;

    const pendingApplications = applications?.filter(app => 
      app.status === "pending"
    ).length || 0;

    const interviewApplications = applications?.filter(app => 
      app.status === "interviewing"
    ).length || 0;

    const rejectedApplications = applications?.filter(app => 
      app.status === "rejected"
    ).length || 0;

    const acceptedApplications = applications?.filter(app => 
      app.status === "accepted"
    ).length || 0;

    const successRate = totalApplications > 0 
      ? Math.round((acceptedApplications / totalApplications) * 100) 
      : 0;

    // Get recommended jobs count
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id")
      .eq("status", "published")
      .limit(10);

    const stats: JobSeekerDashboardStats = {
      profile: {
        is_complete: !!jobSeekerProfile,
        completion_percentage: jobSeekerProfile ? 85 : 20,
        profile_views: 0,
        profile_views_this_month: 0,
        last_updated: profile.updated_at || profile.created_at,
      },
      applications: {
        total_applications: totalApplications,
        pending_applications: pendingApplications,
        interview_applications: interviewApplications,
        rejected_applications: rejectedApplications,
        accepted_applications: acceptedApplications,
        application_success_rate: successRate,
        avg_response_time: 0,
        applications_this_month: applicationsThisMonth,
      },
      jobs: {
        saved_jobs: 0,
        recommended_jobs: jobs?.length || 0,
        new_jobs_in_preferred_industry: 0,
        new_jobs_in_preferred_location: 0,
      },
      activity: {
        recent_applications: [],
        recent_job_views: [],
        upcoming_interviews: [],
      },
      recommendations: {
        profile_improvement_tips: [],
        job_matches: [],
      },
      charts: {
        applications_by_month: [],
        applications_by_status: [],
        job_views_by_day: [],
      },
    };

    return { success: true, data: stats };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
}

async function getEmployerStats(profile: Profile): Promise<Result> {
  const supabase = await createClient();

  try {
    // Get company for employer
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("owner_id", profile.id)
      .single();

    if (!company) {
      return { success: false, error: "Chưa có thông tin công ty" };
    }

    // Get jobs posted by this company
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, status, created_at")
      .eq("company_id", company.id);

    // Get applications for company jobs
    const jobIds = jobs?.map(job => job.id) || [];
    const { data: applications } = await supabase
      .from("applications")
      .select("id, status, applied_at")
      .in("job_id", jobIds);

    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter(job => job.status === "published").length || 0;
    const draftJobs = jobs?.filter(job => job.status === "draft").length || 0;
    const archivedJobs = jobs?.filter(job => job.status === "archived").length || 0;

    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);
    
    const jobsThisMonth = jobs?.filter(job => 
      new Date(job.created_at) > thisMonth
    ).length || 0;

    const applicationsThisMonth = applications?.filter(app => 
      new Date(app.applied_at) > thisMonth
    ).length || 0;

    const pendingApplications = applications?.filter(app => 
      app.status === "pending"
    ).length || 0;

    const stats: EmployerDashboardStats = {
      company: {
        id: company.id,
        name: company.name,
        is_verified: company.is_verified,
        total_jobs_posted: totalJobs,
        active_jobs: activeJobs,
        draft_jobs: draftJobs,
        archived_jobs: archivedJobs,
        total_applications_received: applications?.length || 0,
        profile_completion: 80,
      },
      hiring: {
        jobs_posted_this_month: jobsThisMonth,
        applications_this_month: applicationsThisMonth,
        interviews_scheduled: 0,
        hires_made: 0,
        avg_applications_per_job: totalJobs > 0 ? Math.round((applications?.length || 0) / totalJobs) : 0,
        avg_time_to_hire: 0,
        fill_rate: 0,
      },
      applications: {
        pending_applications: pendingApplications,
        shortlisted_candidates: 0,
        interviews_scheduled: 0,
        offers_made: 0,
        recent_applications: [],
      },
    };

    return { success: true, data: stats };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
}

async function getAdminStats(): Promise<Result> {
  const supabase = await createClient();

  try {
    // Get total counts
    const [usersResult, jobsResult, companiesResult, applicationsResult] = await Promise.all([
      supabase.from("profiles").select("id, role, created_at").eq("is_active", true),
      supabase.from("jobs").select("id, status, created_at"),
      supabase.from("companies").select("id, is_verified, created_at"),
      supabase.from("applications").select("id, applied_at"),
    ]);

    const users = usersResult.data || [];
    const jobs = jobsResult.data || [];
    const companies = companiesResult.data || [];
    const applications = applicationsResult.data || [];

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);

    const newUsersThisWeek = users.filter(user => 
      new Date(user.created_at) > thisWeek
    ).length;

    const pendingJobs = jobs.filter(job => job.status === "pending_approval").length;
    const pendingCompanies = companies.filter(company => !company.is_verified).length;

    const stats: AdminDashboardStats = {
      overview: {
        total_users: users.length,
        total_jobs: jobs.length,
        total_companies: companies.length,
        total_applications: applications.length,
        pending_verifications: pendingCompanies,
        active_sessions: 0,
        revenue_this_month: 0,
        growth_rate: 0,
      },
      user_management: {
        new_users_today: 0,
        new_users_this_week: newUsersThisWeek,
        new_users_this_month: 0,
        active_job_seekers: users.filter(u => u.role === "job_seeker").length,
        active_employers: users.filter(u => u.role === "employer").length,
        inactive_users: 0,
        users_by_role: [
          { role: "job_seeker", count: users.filter(u => u.role === "job_seeker").length, percentage: 0 },
          { role: "employer", count: users.filter(u => u.role === "employer").length, percentage: 0 },
          { role: "admin", count: users.filter(u => u.role === "admin").length, percentage: 0 },
        ],
      },
      content_moderation: {
        pending_job_approvals: pendingJobs,
        pending_company_verifications: pendingCompanies,
        reported_content: 0,
        flagged_applications: 0,
        content_violations: 0,
      },
      system_health: {
        platform_uptime: 99.9,
        avg_response_time: 120,
        error_rate: 0.1,
        active_api_calls: 0,
        storage_usage: 0,
        bandwidth_usage: 0,
      },
      analytics: {
        most_popular_industries: [],
        top_hiring_companies: [],
        geographic_distribution: [],
        success_metrics: {
          job_fill_rate: 0,
          application_success_rate: 0,
          user_retention_rate: 0,
          avg_time_to_hire: 0,
        },
      },
      trends: {
        daily_signups: [],
        job_posting_trends: [],
        application_trends: [],
        revenue_trends: [],
      },
      alerts: {
        system_alerts: [],
        security_alerts: [],
      },
    };

    return { success: true, data: stats };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 