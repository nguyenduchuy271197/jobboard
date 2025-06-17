"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { EmployerDashboardStats, ApplicationStatus } from "@/types/custom.types";
import { checkEmployerAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";

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

    // 2. Check employer authentication
    const authCheck = await checkEmployerAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;
    const supabase = await createClient();

    // 3. Get employer's companies
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name, is_verified")
      .eq("owner_id", user.id);

    if (companiesError || !companies || companies.length === 0) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
    }

    const companyIds = companies.map(c => c.id);
    const mainCompany = companies[0];

    // 4. Date ranges for calculations
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 5. Get company profile stats
    const [
      totalJobsResult,
      activeJobsResult,
      totalApplicationsResult,
      pendingApplicationsResult,
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
    ]);

    // 6. Get hiring metrics
    const [
      newApplicationsThisMonth,
      newJobsThisMonth,
      interviewingApps,
      acceptedApps,
    ] = await Promise.all([
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
    ]);

    // 7. Get applications management data
    const recentApplications = await supabase
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
      .limit(10);

    const currentMonthApplications = newApplicationsThisMonth.count || 0;

    // 8. Format recent applications
    const formattedRecentApplications = recentApplications.data?.map(app => ({
      application_id: app.id,
      candidate_name: (app.applicant as { full_name: string }).full_name || "Ẩn danh",
      candidate_avatar: (app.applicant as { avatar_url: string }).avatar_url || "",
      job_title: (app.jobs as { title: string }).title,
      applied_date: app.applied_at,
      status: app.status,
    })) || [];

    // 9. Format response
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
    console.error("Employer stats error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: ERROR_MESSAGES.VALIDATION.INVALID_FORMAT };
    }
    return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
  }
} 