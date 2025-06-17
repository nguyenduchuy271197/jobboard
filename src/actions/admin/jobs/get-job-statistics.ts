"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import type { JobStatistics } from "@/types/custom.types";

type Result = { 
  success: true; 
  data: JobStatistics;
} | { 
  success: false; 
  error: string 
};

export async function getJobStatistics(): Promise<Result> {
  try {
    // 1. Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // Lấy tất cả jobs
    const { data: allJobs } = await supabase
      .from("jobs")
      .select(`
        status,
        created_at,
        company:companies(name),
        industry:industries(name)
      `);

    if (!allJobs) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Tính toán các số liệu cơ bản
    const totalJobs = allJobs.length;
    const publishedJobs = allJobs.filter(j => j.status === "published").length;
    const pendingJobs = allJobs.filter(j => j.status === "pending_approval").length;
    const draftJobs = allJobs.filter(j => j.status === "draft").length;
    const closedJobs = allJobs.filter(j => j.status === "closed").length;
    const archivedJobs = allJobs.filter(j => j.status === "archived").length;

    const newJobsThisMonth = allJobs.filter(j => 
      new Date(j.created_at) >= thisMonth
    ).length;
    
    const newJobsLastMonth = allJobs.filter(j => {
      const createdAt = new Date(j.created_at);
      return createdAt >= lastMonth && createdAt < thisMonth;
    }).length;

    const growthRate = newJobsLastMonth > 0 
      ? ((newJobsThisMonth - newJobsLastMonth) / newJobsLastMonth) * 100 
      : 0;

    // Jobs by status
    const jobsByStatus = [
      { status: "draft" as const, count: draftJobs },
      { status: "pending_approval" as const, count: pendingJobs },
      { status: "published" as const, count: publishedJobs },
      { status: "closed" as const, count: closedJobs },
      { status: "archived" as const, count: archivedJobs },
    ];

    // Jobs by industry
    const industryCount: Record<string, number> = {};
    allJobs.forEach(job => {
      if (job.industry?.name) {
        industryCount[job.industry.name] = (industryCount[job.industry.name] || 0) + 1;
      }
    });

    const jobsByIndustry = Object.entries(industryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([industry, count]) => ({ industry, count }));

    // Jobs by company
    const companyCount: Record<string, number> = {};
    allJobs.forEach(job => {
      if (job.company?.name) {
        companyCount[job.company.name] = (companyCount[job.company.name] || 0) + 1;
      }
    });

    const jobsByCompany = Object.entries(companyCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([company, count]) => ({ company, count }));

    // Jobs by month (last 12 months)
    const jobsByMonth: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = allJobs.filter(j => {
        const createdAt = new Date(j.created_at);
        return createdAt >= date && createdAt < nextDate;
      }).length;
      
      jobsByMonth.push({
        month: date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' }),
        count,
      });
    }

    // Lấy thống kê applications
    const { data: applications } = await supabase
      .from("applications")
      .select("job_id, created_at");

    const applicationsPerJob = applications ? applications.length / Math.max(publishedJobs, 1) : 0;

    // Tính average time to fill (giả định)
    const avgTimeToFill = 21; // days

    const statistics: JobStatistics = {
      total_jobs: totalJobs,
      active_jobs: publishedJobs,
      pending_jobs: pendingJobs,
      featured_jobs: 0, // Feature functionality not implemented
      draft_jobs: draftJobs,
      archived_jobs: archivedJobs,
      new_jobs_this_month: newJobsThisMonth,
      new_jobs_last_month: newJobsLastMonth,
      growth_rate: Math.round(growthRate * 100) / 100,
      jobs_by_status: jobsByStatus,
      jobs_by_industry: jobsByIndustry,
      jobs_by_company: jobsByCompany,
      jobs_by_month: jobsByMonth,
      applications_per_job: Math.round(applicationsPerJob * 100) / 100,
      avg_time_to_fill: avgTimeToFill,
    };

    return {
      success: true,
      data: statistics,
    };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 