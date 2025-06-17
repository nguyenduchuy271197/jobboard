"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { JobSeekerDashboardStats } from "@/types/custom.types";
import { checkAuthWithRole } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";

const schema = z.object({
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

type Result = 
  | { success: true; data: JobSeekerDashboardStats }
  | { success: false; error: string };

export async function getJobSeekerStats(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate input
    schema.parse(params);

    // 2. Check job seeker authentication
    const authCheck = await checkAuthWithRole("job_seeker");
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user, profile } = authCheck;
    const supabase = await createClient();

    // 3. Get job seeker profile
    const { data: jobSeekerProfile } = await supabase
      .from("job_seeker_profiles")
      .select(`
        headline,
        summary,
        experience_level,
        preferred_salary_min,
        preferred_salary_max,
        skills,
        cv_file_path,
        is_looking_for_job,
        preferred_location_id,
        locations!preferred_location_id(name)
      `)
      .eq("user_id", user.id)
      .single();

    // 4. Date ranges for calculations
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 5. Calculate profile completion
    const profileFields = [
      profile?.full_name,
      profile?.avatar_url,
      jobSeekerProfile?.headline,
      jobSeekerProfile?.summary,
      jobSeekerProfile?.experience_level,
      jobSeekerProfile?.skills?.length,
      jobSeekerProfile?.cv_file_path,
      jobSeekerProfile?.preferred_location_id,
    ];
    const completedFields = profileFields.filter(field => field);
    const profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);

    // 6. Get application statistics
    const [
      totalApplicationsResult,
      applicationsThisMonth,
      pendingApplications,
      interviewingApplications,
      acceptedApplications,
      rejectedApplications,
    ] = await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("applicant_id", user.id),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("applicant_id", user.id)
        .gte("applied_at", currentMonth.toISOString()),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("applicant_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("applicant_id", user.id)
        .eq("status", "interviewing"),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("applicant_id", user.id)
        .eq("status", "accepted"),
      supabase
        .from("applications")
        .select("id", { count: "exact" })
        .eq("applicant_id", user.id)
        .eq("status", "rejected"),
    ]);

    // 7. Get job matching data
    const userSkills = jobSeekerProfile?.skills || [];
    const userLocation = jobSeekerProfile?.preferred_location_id;
    const userExperience = jobSeekerProfile?.experience_level;
    const salaryMin = jobSeekerProfile?.preferred_salary_min;
    const salaryMax = jobSeekerProfile?.preferred_salary_max;

    // Get matching jobs
    let matchingJobsQuery = supabase
      .from("jobs")
      .select(`
        id,
        title,
        description,
        skills_required,
        salary_min,
        salary_max,
        location_id,
        experience_level,
        companies!inner(name, logo_url),
        locations!inner(name)
      `)
      .eq("status", "published");

    // Add filters based on user preferences
    if (userLocation) {
      matchingJobsQuery = matchingJobsQuery.eq("location_id", userLocation);
    }
    if (userExperience) {
      matchingJobsQuery = matchingJobsQuery.eq("experience_level", userExperience);
    }

    const { data: potentialJobs } = await matchingJobsQuery.limit(50);

    // Calculate job matches based on skills and salary
    const jobMatches = potentialJobs?.map(job => {
      const jobSkills = job.skills_required || [];
      const skillMatches = userSkills.filter(skill => 
        jobSkills.some(jobSkill => 
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      ).length;
      
      const skillScore = userSkills.length > 0 ? (skillMatches / userSkills.length) * 100 : 0;
      
      let salaryScore = 0;
      if (salaryMin && salaryMax && job.salary_min && job.salary_max) {
        const userSalaryRange = salaryMax - salaryMin;
        const jobSalaryRange = job.salary_max - job.salary_min;
        const overlap = Math.max(0, Math.min(salaryMax, job.salary_max) - Math.max(salaryMin, job.salary_min));
        salaryScore = (overlap / Math.max(userSalaryRange, jobSalaryRange)) * 100;
      }
      
      const overallMatch = Math.round((skillScore * 0.7 + salaryScore * 0.3));
      
      return {
        job_id: job.id,
        job_title: job.title,
        company_name: (job.companies as { name: string }).name,
        company_logo: (job.companies as { logo_url: string }).logo_url,
        location: (job.locations as { name: string }).name,
        match_percentage: overallMatch,
        matching_skills: skillMatches,
        salary_range: job.salary_min && job.salary_max 
          ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} VND`
          : "Thỏa thuận",
      };
    })
    ?.filter(job => job.match_percentage >= 30)
    ?.sort((a, b) => b.match_percentage - a.match_percentage)
    ?.slice(0, 10) || [];

    // 8. Get activity metrics - applications timeline for last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    const applicationActivity = await Promise.all(
      last30Days.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const result = await supabase
          .from("applications")
          .select("id", { count: "exact" })
          .eq("applicant_id", user.id)
          .gte("applied_at", date + "T00:00:00Z")
          .lt("applied_at", nextDate.toISOString().split('T')[0] + "T00:00:00Z");
        
        return {
          date,
          applications: result.count || 0,
        };
      })
    );

    // 9. Get recent applications with job details
    const { data: recentApplications } = await supabase
      .from("applications")
      .select(`
        id,
        applied_at,
        status,
        jobs!inner(title, companies!inner(name, logo_url))
      `)
      .eq("applicant_id", user.id)
      .order("applied_at", { ascending: false })
      .limit(10);

    const formattedRecentApplications = recentApplications?.map(app => ({
      application_id: app.id,
      job_title: (app.jobs as { title: string }).title,
      company_name: ((app.jobs as { companies: { name: string; logo_url?: string } }).companies).name,
      company_logo: ((app.jobs as { companies: { name: string; logo_url?: string } }).companies).logo_url,
      applied_date: app.applied_at,
      status: app.status,
    })) || [];

    // 10. Calculate success metrics
    const totalApps = totalApplicationsResult.count || 0;
    const successRate = totalApps > 0
      ? Math.round(((acceptedApplications.count || 0) / totalApps) * 100)
      : 0;

    const currentMonthApps = applicationsThisMonth.count || 0;

    // 11. Format response
    const jobSeekerStats: JobSeekerDashboardStats = {
      profile: {
        is_complete: profileCompletion >= 100,
        completion_percentage: profileCompletion,
        profile_views: 0, // This would need to be tracked separately
        profile_views_this_month: 0, // This would need to be tracked separately
        last_updated: new Date().toISOString(), // This would need to be tracked separately
      },
      applications: {
        total_applications: totalApps,
        pending_applications: pendingApplications.count || 0,
        interview_applications: interviewingApplications.count || 0,
        rejected_applications: rejectedApplications.count || 0,
        accepted_applications: acceptedApplications.count || 0,
        application_success_rate: successRate,
        avg_response_time: 3, // This would need to be calculated from actual response times
        applications_this_month: currentMonthApps,
      },
      jobs: {
        saved_jobs: 0, // This would need to be tracked separately
        recommended_jobs: jobMatches.length,
        new_jobs_in_preferred_industry: 0, // This would need to be calculated
        new_jobs_in_preferred_location: 0, // This would need to be calculated
      },
      activity: {
        recent_applications: formattedRecentApplications.map(app => ({
          id: app.application_id,
          job_title: app.job_title,
          company_name: app.company_name,
          applied_at: app.applied_date,
          status: app.status,
          response_time: undefined,
        })),
        recent_job_views: [], // This would need to be tracked separately
        upcoming_interviews: [], // This would need to be tracked separately
      },
      recommendations: {
        profile_improvement_tips: profileCompletion < 100 ? [
          "Hoàn thiện các trường thông tin còn thiếu để tăng cơ hội được tuyển dụng"
        ] : [],
        job_matches: jobMatches.map(job => ({
          job_id: job.job_id,
          job_title: job.job_title,
          company_name: job.company_name,
          match_score: job.match_percentage,
          salary_range: job.salary_range,
          location: job.location,
        })),
      },
      charts: {
        applications_by_month: applicationActivity.map(activity => ({
          month: activity.date,
          count: activity.applications,
        })),
        applications_by_status: [
          { status: "pending", count: pendingApplications.count || 0 },
          { status: "interviewing", count: interviewingApplications.count || 0 },
          { status: "rejected", count: rejectedApplications.count || 0 },
          { status: "accepted", count: acceptedApplications.count || 0 },
        ],
        job_views_by_day: [], // This would need to be tracked separately
      },
    };

    return {
      success: true,
      data: jobSeekerStats,
    };
  } catch (error) {
    console.error("Job seeker stats error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: ERROR_MESSAGES.VALIDATION.INVALID_FORMAT };
    }
    return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
  }
} 