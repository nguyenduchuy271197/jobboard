"use server";

import { createClient } from "@/lib/supabase/server";

type CompanyStatistics = {
  total_companies: number;
  verified_companies: number;
  pending_companies: number;
  companies_with_jobs: number;
  new_companies_this_month: number;
  new_companies_last_month: number;
  growth_rate: number;
  companies_by_industry: {
    industry_name: string;
    count: number;
  }[];
  companies_by_location: {
    location_name: string;
    count: number;
  }[];
  companies_by_size: {
    size: string;
    count: number;
  }[];
  companies_by_month: {
    month: string;
    count: number;
  }[];
  top_companies_by_jobs: {
    company_name: string;
    jobs_count: number;
  }[];
};

type Result = 
  | { success: true; data: CompanyStatistics }
  | { success: false; error: string };

export async function getCompanyStatistics(): Promise<Result> {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Chưa đăng nhập" };
    }

    // 2. Check admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return { success: false, error: "Không có quyền truy cập" };
    }

    // 3. Calculate date ranges
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 4. Get basic counts
    const [
      totalResult,
      verifiedResult,
      pendingResult,
      companiesWithJobsResult,
      thisMonthResult,
      lastMonthResult,
    ] = await Promise.all([
      // Total companies
      supabase.from("companies").select("id", { count: "exact", head: true }),
      
      // Verified companies
      supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_verified", true),
      
      // Pending companies
      supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_verified", false),
      
      // Companies with jobs
      supabase.from("companies").select("id", { count: "exact", head: true }).gt("id", 0).not("jobs", "is", null),
      
      // New companies this month
      supabase.from("companies").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart.toISOString()),
      
      // New companies last month
      supabase.from("companies").select("id", { count: "exact", head: true })
        .gte("created_at", lastMonthStart.toISOString())
        .lt("created_at", lastMonthEnd.toISOString()),
    ]);

    // 5. Get companies by industry
    const { data: companiesByIndustry } = await supabase
      .from("companies")
      .select(`
        industry:industries(name),
        count
      `)
      .not("industry_id", "is", null);

    // 6. Get companies by location
    const { data: companiesByLocation } = await supabase
      .from("companies")
      .select(`
        location:locations(name),
        count
      `)
      .not("location_id", "is", null);

    // 7. Get companies by size
    const { data: companiesBySize } = await supabase
      .from("companies")
      .select("size")
      .not("size", "is", null);

    // 8. Get companies by month (last 12 months)
    const { data: companiesByMonth } = await supabase
      .from("companies")
      .select("created_at")
      .gte("created_at", new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString())
      .order("created_at");

    // 9. Get top companies by job count
    const { data: topCompaniesByJobs } = await supabase
      .from("companies")
      .select(`
        name,
        jobs(count)
      `)
      .order("jobs.count", { ascending: false })
      .limit(10);

    // 10. Process data
    const total_companies = totalResult.count || 0;
    const verified_companies = verifiedResult.count || 0;
    const pending_companies = pendingResult.count || 0;
    const companies_with_jobs = companiesWithJobsResult.count || 0;
    const new_companies_this_month = thisMonthResult.count || 0;
    const new_companies_last_month = lastMonthResult.count || 0;
    
    const growth_rate = new_companies_last_month > 0 
      ? ((new_companies_this_month - new_companies_last_month) / new_companies_last_month) * 100
      : new_companies_this_month > 0 ? 100 : 0;

    // Process industry data
    const industryCount: Record<string, number> = {};
    companiesByIndustry?.forEach((company) => {
      if (company.industry?.name) {
        industryCount[company.industry.name] = (industryCount[company.industry.name] || 0) + 1;
      }
    });

    // Process location data
    const locationCount: Record<string, number> = {};
    companiesByLocation?.forEach((company) => {
      if (company.location?.name) {
        locationCount[company.location.name] = (locationCount[company.location.name] || 0) + 1;
      }
    });

    // Process size data
    const sizeCount: Record<string, number> = {};
    companiesBySize?.forEach((company) => {
      if (company.size) {
        sizeCount[company.size] = (sizeCount[company.size] || 0) + 1;
      }
    });

    // Process monthly data
    const monthCount: Record<string, number> = {};
    companiesByMonth?.forEach((company) => {
      const month = new Date(company.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' });
      monthCount[month] = (monthCount[month] || 0) + 1;
    });

    const statistics: CompanyStatistics = {
      total_companies,
      verified_companies,
      pending_companies,
      companies_with_jobs,
      new_companies_this_month,
      new_companies_last_month,
      growth_rate: Math.round(growth_rate * 100) / 100,
      companies_by_industry: Object.entries(industryCount)
        .map(([industry_name, count]) => ({ industry_name, count }))
        .sort((a, b) => b.count - a.count),
      companies_by_location: Object.entries(locationCount)
        .map(([location_name, count]) => ({ location_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      companies_by_size: Object.entries(sizeCount)
        .map(([size, count]) => ({ size, count }))
        .sort((a, b) => b.count - a.count),
      companies_by_month: Object.entries(monthCount)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      top_companies_by_jobs: (topCompaniesByJobs || [])
        .map((company) => ({
          company_name: company.name,
          jobs_count: company.jobs?.length || 0,
        }))
        .filter(item => item.jobs_count > 0)
        .slice(0, 10),
    };

    return { success: true, data: statistics };
  } catch {
    return { success: false, error: "Đã có lỗi xảy ra khi lấy thống kê" };
  }
} 