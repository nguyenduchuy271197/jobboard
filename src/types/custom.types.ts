import { Database } from "./database.types";
import type { User, Session } from "@supabase/supabase-js";

export type Row<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateDto<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Auth Types
export type AuthUser = User;
export type AuthSession = Session;

// Core Job Board Types
export type Job = Row<"jobs">;
export type JobInsertDto = InsertDto<"jobs">;
export type JobUpdateDto = UpdateDto<"jobs">;

export type Application = Row<"applications">;
export type ApplicationInsertDto = InsertDto<"applications">;
export type ApplicationUpdateDto = UpdateDto<"applications">;

export type Company = Row<"companies">;
export type CompanyInsertDto = InsertDto<"companies">;
export type CompanyUpdateDto = UpdateDto<"companies">;

export type Profile = Row<"profiles">;
export type ProfileInsertDto = InsertDto<"profiles">;
export type ProfileUpdateDto = UpdateDto<"profiles">;

export type JobSeekerProfile = Row<"job_seeker_profiles">;
export type JobSeekerProfileInsertDto = InsertDto<"job_seeker_profiles">;
export type JobSeekerProfileUpdateDto = UpdateDto<"job_seeker_profiles">;

export type Location = Row<"locations">;
export type LocationInsertDto = InsertDto<"locations">;
export type LocationUpdateDto = UpdateDto<"locations">;

export type Industry = Row<"industries">;
export type IndustryInsertDto = InsertDto<"industries">;
export type IndustryUpdateDto = UpdateDto<"industries">;

export type UserRole = Database["public"]["Enums"]["user_role"];
export type ApplicationStatus = Database["public"]["Enums"]["application_status"];
export type JobStatus = Database["public"]["Enums"]["job_status"];
export type EmploymentType = Database["public"]["Enums"]["employment_type"];
export type ExperienceLevel = Database["public"]["Enums"]["experience_level"];
export type CompanySize = Database["public"]["Enums"]["company_size"];

// Application Management Types
export type DatabaseJobApplication = Application & {
  job?: Partial<Job> & {
    location?: Location | null;
    company?: Partial<Company> & {
      industry?: Industry | null;
      location?: Location | null;
    };
  };
  applicant?: Profile & {
    job_seeker_profile?: (JobSeekerProfile & {
      preferred_location?: Location | null;
    }) | null;
  };
};

export type CreateJobApplicationData = {
  job_id: number;
  cover_letter?: string;
};

export type JobApplicationsFilter = {
  job_id?: number;
  company_id?: number;
  status?: ApplicationStatus;
  applied_after?: string;
  applied_before?: string;
  limit?: number;
  offset?: number;
};

// Company Management Types
export type DatabaseCompany = Company & {
  industry?: Industry;
  location?: Location;
};

export type CompaniesFilter = {
  search?: string;
  industry_id?: number;
  location_id?: number;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
};

export type CreateCompanyData = {
  name: string;
  description?: string;
  website_url?: string;
  industry_id?: number;
  location_id?: number;
  size?: CompanySize;
  address?: string;
  founded_year?: number;
  employee_count?: number;
};

export type UpdateCompanyData = Partial<CreateCompanyData>;

// Job Management Types  
export type DatabaseJob = Job & {
  company?: DatabaseCompany;
  industry?: Industry;
  location?: Location;
};

export type JobsFilter = {
  search?: string;
  company_id?: number;
  industry_id?: number;
  location_id?: number;
  employment_type?: EmploymentType;
  experience_level?: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  is_featured?: boolean;
  status?: JobStatus;
  limit?: number;
  offset?: number;
};

export type CreateJobData = {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  employment_type: EmploymentType;
  experience_level?: ExperienceLevel;
  industry_id?: number;
  location_id?: number;
  address?: string;
  is_remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  skills_required?: string[];
  application_deadline?: string;
};

export type UpdateJobData = Partial<CreateJobData>;

// Job Seeker Profile Management Types
export type DatabaseJobSeekerProfile = JobSeekerProfile & {
  industry?: Industry;
  location?: Location;
  user?: Profile;
};

export type JobSeekerProfilesFilter = {
  search?: string;
  industry_id?: number;
  location_id?: number;
  experience_level?: ExperienceLevel;
  employment_type?: EmploymentType;
  salary_expectation_min?: number;
  salary_expectation_max?: number;
  is_available?: boolean;
  limit?: number;
  offset?: number;
};

export type CreateJobSeekerProfileData = {
  headline: string;
  summary: string;
  experience_level: ExperienceLevel;
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  preferred_location_id?: number;
  skills: string[];
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
  is_looking_for_job?: boolean;
};

export type UpdateJobSeekerProfileData = Partial<CreateJobSeekerProfileData>;

// Industry Management Types
export type IndustriesFilter = {
  search?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
};

export type CreateIndustryData = {
  name: string;
  description?: string;
  slug: string;
  is_active?: boolean;
};

export type UpdateIndustryData = Partial<CreateIndustryData>;

// Location Management Types
export type LocationsFilter = {
  search?: string;
  limit?: number;
  offset?: number;
};

export type CreateLocationData = {
  name: string;
  slug: string;
};

export type UpdateLocationData = Partial<CreateLocationData>;

// Admin User Management Types
export type AdminUsersFilter = {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
};

export type AdminUserDetails = Profile & {
  job_seeker_profile?: JobSeekerProfile & {
    preferred_location?: Location | null;
  } | null;
  companies?: Company[];
  jobs_count?: number;
  applications_count?: number;
  last_login?: string;
};

export type UpdateUserRoleData = {
  user_id: string;
  role: UserRole;
};

export type UserStatistics = {
  total_users: number;
  active_users: number;
  inactive_users: number;
  job_seekers: number;
  employers: number;
  admins: number;
  new_users_this_month: number;
  new_users_last_month: number;
  growth_rate: number;
  users_by_role: {
    role: UserRole;
    count: number;
  }[];
  users_by_month: {
    month: string;
    count: number;
  }[];
  top_locations: {
    location: string;
    count: number;
  }[];
};

export type ExportUsersData = {
  format: 'csv' | 'xlsx' | 'json';
  include_inactive?: boolean;
  role_filter?: UserRole;
  date_range?: {
    start: string;
    end: string;
  };
};

// Admin Job Management Types
export type AdminJobsFilter = {
  search?: string;
  status?: JobStatus;
  company_id?: number;
  industry_id?: number;
  is_featured?: boolean;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
};

export type JobStatistics = {
  total_jobs: number;
  active_jobs: number;
  pending_jobs: number;
  featured_jobs: number;
  draft_jobs: number;
  archived_jobs: number;
  new_jobs_this_month: number;
  new_jobs_last_month: number;
  growth_rate: number;
  jobs_by_status: {
    status: JobStatus;
    count: number;
  }[];
  jobs_by_industry: {
    industry: string;
    count: number;
  }[];
  jobs_by_company: {
    company: string;
    count: number;
  }[];
  jobs_by_month: {
    month: string;
    count: number;
  }[];
  applications_per_job: number;
  avg_time_to_fill: number;
};

export type BulkUpdateJobsData = {
  job_ids: number[];
  action: 'approve' | 'reject' | 'archive' | 'delete';
  reason?: string;
};

export type ExportJobsData = {
  format: 'csv' | 'xlsx' | 'json';
  include_draft?: boolean;
  include_archived?: boolean;
  status_filter?: JobStatus;
  company_filter?: number;
  industry_filter?: number;
  date_range?: {
    start: string;
    end: string;
  };
};

// Dashboard Types
export type DashboardDateRange = {
  start: string;
  end: string;
};

export type GeneralDashboardStats = {
  overview: {
    total_jobs: number;
    total_companies: number;
    total_job_seekers: number;
    total_applications: number;
    active_jobs: number;
    pending_applications: number;
    new_users_this_month: number;
    jobs_filled_this_month: number;
  };
  growth: {
    jobs_growth: number;
    companies_growth: number;
    applications_growth: number;
    users_growth: number;
  };
  recent_activity: {
    recent_jobs: Array<{
      id: number;
      title: string;
      company_name: string;
      created_at: string;
      applications_count: number;
    }>;
    recent_applications: Array<{
      id: number;
      job_title: string;
      company_name: string;
      applicant_name: string;
      created_at: string;
      status: ApplicationStatus;
    }>;
    recent_companies: Array<{
      id: number;
      name: string;
      industry: string;
      created_at: string;
      is_verified: boolean;
    }>;
  };
  charts: {
    jobs_by_month: Array<{
      month: string;
      count: number;
    }>;
    applications_by_status: Array<{
      status: string;
      count: number;
    }>;
    companies_by_industry: Array<{
      industry: string;
      count: number;
    }>;
    top_locations: Array<{
      location: string;
      count: number;
    }>;
  };
};

export type JobSeekerDashboardStats = {
  profile: {
    is_complete: boolean;
    completion_percentage: number;
    profile_views: number;
    profile_views_this_month: number;
    last_updated: string;
  };
  applications: {
    total_applications: number;
    pending_applications: number;
    interview_applications: number;
    rejected_applications: number;
    accepted_applications: number;
    application_success_rate: number;
    avg_response_time: number;
    applications_this_month: number;
  };
  jobs: {
    saved_jobs: number;
    recommended_jobs: number;
    new_jobs_in_preferred_industry: number;
    new_jobs_in_preferred_location: number;
  };
  activity: {
    recent_applications: Array<{
      id: number;
      job_title: string;
      company_name: string;
      applied_at: string;
      status: string;
      response_time?: number;
    }>;
    recent_job_views: Array<{
      job_id: number;
      job_title: string;
      company_name: string;
      viewed_at: string;
      is_applied: boolean;
    }>;
    upcoming_interviews: Array<{
      application_id: number;
      job_title: string;
      company_name: string;
      interview_date?: string;
      interview_type?: string;
    }>;
  };
  recommendations: {
    profile_improvement_tips: string[];
    job_matches: Array<{
      job_id: number;
      job_title: string;
      company_name: string;
      match_score: number;
      salary_range?: string;
      location: string;
    }>;
  };
  charts: {
    applications_by_month: Array<{
      month: string;
      count: number;
    }>;
    applications_by_status: Array<{
      status: string;
      count: number;
    }>;
    job_views_by_day: Array<{
      date: string;
      views: number;
    }>;
  };
};

export type EmployerDashboardStats = {
  company: {
    id: number;
    name: string;
    is_verified: boolean;
    total_jobs_posted: number;
    active_jobs: number;
    draft_jobs: number;
    archived_jobs: number;
    total_applications_received: number;
    profile_completion: number;
  };
  hiring: {
    jobs_posted_this_month: number;
    applications_this_month: number;
    interviews_scheduled: number;
    hires_made: number;
    avg_applications_per_job: number;
    avg_time_to_hire: number;
    fill_rate: number;
  };
  applications: {
    pending_applications: number;
    shortlisted_candidates: number;
    interviews_scheduled: number;
    offers_made: number;
    recent_applications: Array<{
      id: number;
      applicant_name: string;
      job_title: string;
      applied_at: string;
      status: ApplicationStatus;
    }>;
  };
};

export type AdminDashboardStats = {
  overview: {
    total_users: number;
    total_jobs: number;
    total_companies: number;
    total_applications: number;
    pending_verifications: number;
    active_sessions: number;
    revenue_this_month: number;
    growth_rate: number;
  };
  user_management: {
    new_users_today: number;
    new_users_this_week: number;
    new_users_this_month: number;
    active_job_seekers: number;
    active_employers: number;
    inactive_users: number;
    users_by_role: Array<{
      role: string;
      count: number;
      percentage: number;
    }>;
  };
  content_moderation: {
    pending_job_approvals: number;
    pending_company_verifications: number;
    reported_content: number;
    flagged_applications: number;
    content_violations: number;
  };
  system_health: {
    platform_uptime: number;
    avg_response_time: number;
    error_rate: number;
    active_api_calls: number;
    storage_usage: number;
    bandwidth_usage: number;
  };
  analytics: {
    most_popular_industries: Array<{
      industry: string;
      job_count: number;
      application_count: number;
    }>;
    top_hiring_companies: Array<{
      company_name: string;
      jobs_posted: number;
      applications_received: number;
      hire_rate: number;
    }>;
    geographic_distribution: Array<{
      location: string;
      user_count: number;
      job_count: number;
    }>;
    success_metrics: {
      job_fill_rate: number;
      application_success_rate: number;
      user_retention_rate: number;
      avg_time_to_hire: number;
    };
  };
  trends: {
    daily_signups: Array<{
      date: string;
      count: number;
    }>;
    job_posting_trends: Array<{
      date: string;
      count: number;
    }>;
    application_trends: Array<{
      date: string;
      count: number;
    }>;
    revenue_trends: Array<{
      month: string;
      revenue: number;
    }>;
  };
  alerts: {
    system_alerts: Array<{
      type: string;
      message: string;
      severity: string;
      timestamp: string;
    }>;
    security_alerts: Array<{
      type: string;
      description: string;
      ip_address?: string;
      timestamp: string;
    }>;
  };
};

// Reports Types
export type ApplicationReportParams = {
  date_range?: DashboardDateRange;
  status_filter?: ApplicationStatus;
  industry_filter?: number;
  location_filter?: number;
  company_filter?: number;
  experience_level_filter?: ExperienceLevel;
};

export type ApplicationReportData = {
  summary: {
    total_applications: number;
    period: string;
    success_rate: number;
    avg_response_time: number;
    most_active_industry: string;
    most_active_location: string;
  };
  status_breakdown: Array<{
    status: string;
    count: number;
    percentage: number;
    change_from_previous?: number;
  }>;
  industry_analysis: Array<{
    industry: string;
    applications: number;
    percentage: number;
  }>;
  location_analysis: Array<{
    location: string;
    applications: number;
    percentage: number;
  }>;
  timeline_analysis: Array<{
    date: string;
    applications: number;
  }>;
  company_performance: Array<{
    company_id: number;
    company_name: string;
    total_applications: number;
    accepted_applications: number;
    success_rate: number;
  }>;
  experience_level_trends: Array<{
    experience_level: string;
    applications: number;
    percentage: number;
  }>;
  funnel_analysis: Array<{
    stage: string;
    count: number;
    percentage: number;
    conversion_rate: number;
  }>;
  top_performing_jobs: Array<{
    job_id: number;
    job_title: string;
    total_applications: number;
    success_rate: number;
  }>;
  candidate_insights: Array<{
    metric: string;
    value: string;
    trend: "increase" | "decrease" | "stable";
    description: string;
  }>;
};

export type JobPerformanceParams = {
  date_range?: DashboardDateRange;
  company_id?: number;
  industry_filter?: number;
  location_filter?: number;
};

export type JobPerformanceData = {
  overview: {
    total_jobs: number;
    active_jobs: number;
    total_views: number;
    total_applications: number;
    avg_views_per_job: number;
    avg_applications_per_job: number;
    overall_conversion_rate: number;
    period: string;
  };
  performance_metrics: Array<{
    job_id: number;
    job_title: string;
    company_name: string;
    company_logo?: string;
    industry: string;
    location: string;
    employment_type: string;
    experience_level: string | null;
    published_date: string;
    status: string;
    views: number;
    applications: number;
    conversion_rate: number;
    success_rate: number;
    avg_applications_per_day: number;
    days_active: number;
    quality_score: number;
    salary_range: string;
  }>;
  industry_performance: Array<{
    industry_id: number;
    industry_name: string;
    total_jobs: number;
    total_views: number;
    total_applications: number;
    avg_views_per_job: number;
    avg_applications_per_job: number;
    conversion_rate: number;
  }>;
  location_performance: Array<{
    location_id: number;
    location_name: string;
    total_jobs: number;
    total_views: number;
    total_applications: number;
    avg_views_per_job: number;
    avg_applications_per_job: number;
    conversion_rate: number;
  }>;
  trending_skills: Array<{
    skill: string;
    demand_count: number;
    growth_rate: number;
    avg_salary: number;
  }>;
  salary_analysis: Array<{
    experience_level: string;
    job_count: number;
    avg_salary: number;
    min_salary: number;
    max_salary: number;
  }>;
  job_lifecycle: Array<{
    job_id: number;
    job_title: string;
    published_date: string;
    days_active: number;
    current_status: string;
    applications_received: number;
    views_received: number;
    stage: string;
  }>;
  top_performing_jobs: Array<{
    job_id: number;
    job_title: string;
    company_name: string;
    company_logo?: string;
    industry: string;
    location: string;
    employment_type: string;
    experience_level: string | null;
    published_date: string;
    status: string;
    views: number;
    applications: number;
    conversion_rate: number;
    success_rate: number;
    avg_applications_per_day: number;
    days_active: number;
    quality_score: number;
    salary_range: string;
  }>;
  underperforming_jobs: Array<{
    job_id: number;
    job_title: string;
    company_name: string;
    company_logo?: string;
    industry: string;
    location: string;
    employment_type: string;
    experience_level: string | null;
    published_date: string;
    status: string;
    views: number;
    applications: number;
    conversion_rate: number;
    success_rate: number;
    avg_applications_per_day: number;
    days_active: number;
    quality_score: number;
    salary_range: string;
  }>;
};

export type ExportReportParams = {
  report_type: "applications" | "jobs" | "companies" | "users";
  format: "csv" | "json" | "pdf";
  date_range?: DashboardDateRange;
  filters?: Record<string, string | number | boolean>;
  include_details?: boolean;
};

export type ExportReportData = {
  file_content: string;
  file_name: string;
  mime_type: string;
  total_records: number;
};

export type ApplicationReportItem = {
  id: number;
  applied_at: string;
  status: ApplicationStatus;
  cover_letter: string | null;
  custom_cv_path: string | null;
  job?: { title: string; company?: { name: string } } | null;
  applicant?: { full_name: string | null; email: string } | null;
};

export type JobReportItem = {
  id: number;
  title: string;
  description: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  experience_level: ExperienceLevel | null;
  employment_type: EmploymentType;
  company?: { name: string } | null;
  location?: { name: string } | null;
  industry?: { name: string } | null;
  applications?: Array<{ id: number }>;
};

export type CompanyReportItem = {
  id: number;
  name: string;
  description: string | null;
  website_url: string | null;
  size: CompanySize | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  industry?: { name: string } | null;
  location?: { name: string } | null;
  jobs?: Array<{ id: number }>;
};

export type UserReportItem = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  job_seeker_profile?: { 
    experience_level: ExperienceLevel | null;
    is_looking_for_job: boolean;
  } | null;
  companies?: Array<{ id: number; name: string }>;
};

export type ReportDataItem = ApplicationReportItem | JobReportItem | CompanyReportItem | UserReportItem;

// File Management Types
export type FileBucket = "cvs" | "company-logos" | "avatars";

export type FileMetadata = {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  size: number;
  mimetype: string;
  etag: string;
  path: string;
  bucket: FileBucket;
};

export type UploadFileData = {
  bucket: FileBucket;
  folder?: string;
  filename?: string;
};

export type DeleteFileData = {
  bucket: FileBucket;
  path: string;
};

export type GetFileUrlData = {
  bucket: FileBucket;
  path: string;
  expiresIn?: number;
};

export type GetFileData = {
  bucket: FileBucket;
  path: string;
};


