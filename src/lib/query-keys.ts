export const QUERY_KEYS = {
  users: {
    all: ["users"] as const,
    profile: (userId?: string) => [...QUERY_KEYS.users.all, "profile", userId] as const,
    currentProfile: () => [...QUERY_KEYS.users.all, "current-profile"] as const,
  },
  auth: {
    all: ["auth"] as const,
    currentUser: () => [...QUERY_KEYS.auth.all, "current-user"] as const,
    user: () => ["auth", "user"] as const,
    userRole: () => ["auth", "user", "role"] as const,
  },
  locations: {
    all: ["locations"] as const,
    lists: () => [...QUERY_KEYS.locations.all, "list"] as const,
    list: (filters?: { search?: string; limit?: number; offset?: number }) => [...QUERY_KEYS.locations.lists(), filters] as const,
    detail: (id: number) => [...QUERY_KEYS.locations.all, "detail", id] as const,
  },
  industries: {
    all: ["industries"] as const,
    lists: () => [...QUERY_KEYS.industries.all, "list"] as const,
    list: (filters?: { search?: string; is_active?: boolean; limit?: number; offset?: number }) => [...QUERY_KEYS.industries.lists(), filters] as const,
    detail: (id: number) => [...QUERY_KEYS.industries.all, "detail", id] as const,
  },
  companies: {
    all: ["companies"] as const,
    lists: () => [...QUERY_KEYS.companies.all, "list"] as const,
    list: (filters?: { search?: string; industry_id?: number; location_id?: number; is_verified?: boolean; limit?: number; offset?: number }) => [...QUERY_KEYS.companies.lists(), filters] as const,
    detail: (id: number) => [...QUERY_KEYS.companies.all, "detail", id] as const,
    userCompanies: (userId?: string) => [...QUERY_KEYS.companies.all, "user", userId] as const,
  },
  jobs: {
    all: ["jobs"] as const,
    lists: () => [...QUERY_KEYS.jobs.all, "list"] as const,
    list: (filters?: { 
      search?: string; 
      company_id?: number; 
      industry_id?: number; 
      location_id?: number; 
      employment_type?: string; 
      experience_level?: string; 
      salary_min?: number; 
      salary_max?: number; 
      is_remote?: boolean; 
      is_featured?: boolean; 
      status?: string; 
      limit?: number; 
      offset?: number 
    }) => [...QUERY_KEYS.jobs.lists(), filters] as const,
    detail: (id: number) => [...QUERY_KEYS.jobs.all, "detail", id] as const,
    userJobs: (userId?: string) => [...QUERY_KEYS.jobs.all, "user", userId] as const,
    companyJobs: (companyId: number) => [...QUERY_KEYS.jobs.all, "company", companyId] as const,
  },
  jobSeekerProfiles: {
    all: ["job-seeker-profiles"] as const,
    lists: () => [...QUERY_KEYS.jobSeekerProfiles.all, "list"] as const,
    list: (filters?: { 
      search?: string; 
      industry_id?: number; 
      location_id?: number; 
      experience_level?: string; 
      employment_type?: string; 
      salary_expectation_min?: number; 
      salary_expectation_max?: number; 
      is_available?: boolean; 
      limit?: number; 
      offset?: number 
    }) => [...QUERY_KEYS.jobSeekerProfiles.lists(), filters] as const,
    detail: (userId: string) => [...QUERY_KEYS.jobSeekerProfiles.all, "detail", userId] as const,
    current: () => [...QUERY_KEYS.jobSeekerProfiles.all, "current"] as const,
  },
  applications: {
    all: ["applications"] as const,
    lists: () => [...QUERY_KEYS.applications.all, "list"] as const,
    list: (filters?: { 
      job_id?: number; 
      company_id?: number; 
      status?: string; 
      applied_after?: string; 
      applied_before?: string; 
      limit?: number; 
      offset?: number 
    }) => [...QUERY_KEYS.applications.lists(), filters] as const,
    detail: (id: number) => [...QUERY_KEYS.applications.all, "detail", id] as const,
    userApplications: (userId?: string) => [...QUERY_KEYS.applications.all, "user", userId] as const,
    jobApplications: (jobId: number) => [...QUERY_KEYS.applications.all, "job", jobId] as const,
    companyApplications: (companyId: number) => [...QUERY_KEYS.applications.all, "company", companyId] as const,
  },
  admin: {
    all: ["admin"] as const,
    users: {
      all: () => [...QUERY_KEYS.admin.all, "users"] as const,
      lists: () => [...QUERY_KEYS.admin.users.all(), "list"] as const,
      list: (filters?: { 
        search?: string; 
        role?: string; 
        is_active?: boolean; 
        created_after?: string; 
        created_before?: string; 
        limit?: number; 
        offset?: number 
      }) => [...QUERY_KEYS.admin.users.lists(), filters] as const,
      detail: (userId: string) => [...QUERY_KEYS.admin.users.all(), "detail", userId] as const,
      statistics: () => [...QUERY_KEYS.admin.users.all(), "statistics"] as const,
    },
    jobs: {
      all: () => [...QUERY_KEYS.admin.all, "jobs"] as const,
      lists: () => [...QUERY_KEYS.admin.jobs.all(), "list"] as const,
      list: (filters?: { 
        search?: string; 
        status?: string; 
        company_id?: number; 
        industry_id?: number; 
        is_featured?: boolean; 
        created_after?: string; 
        created_before?: string; 
        limit?: number; 
        offset?: number 
      }) => [...QUERY_KEYS.admin.jobs.lists(), filters] as const,
      pending: () => [...QUERY_KEYS.admin.jobs.all(), "pending"] as const,
      statistics: () => [...QUERY_KEYS.admin.jobs.all(), "statistics"] as const,
    },
    companies: {
      all: () => [...QUERY_KEYS.admin.all, "companies"] as const,
      lists: () => [...QUERY_KEYS.admin.companies.all(), "list"] as const,
      list: (filters?: { 
        search?: string; 
        industry_id?: number; 
        location_id?: number; 
        is_verified?: boolean; 
        limit?: number; 
        offset?: number 
      }) => [...QUERY_KEYS.admin.companies.lists(), filters] as const,
      pending: () => [...QUERY_KEYS.admin.companies.all(), "pending"] as const,
      statistics: () => [...QUERY_KEYS.admin.companies.all(), "statistics"] as const,
    },
  },
  dashboard: {
    generalStats: (params?: { date_range?: { start: string; end: string } }) => ["dashboard", "general-stats", params] as const,
    jobSeekerStats: (params?: { user_id?: string; date_range?: { start: string; end: string } }) => ["dashboard", "job-seeker-stats", params] as const,
    employerStats: (params?: { company_id?: number; date_range?: { start: string; end: string } }) => ["dashboard", "employer-stats", params] as const,
    adminStats: (params?: { date_range?: { start: string; end: string } }) => ["dashboard", "admin-stats", params] as const,
  },
  reports: {
    applicationReport: (params?: { 
      date_range?: { start: string; end: string }; 
      status_filter?: string; 
      industry_filter?: number; 
      location_filter?: number; 
      company_filter?: number; 
      experience_level_filter?: string 
    }) => ["reports", "applications", params] as const,
    jobPerformance: (params?: { 
      date_range?: { start: string; end: string }; 
      company_id?: number; 
      industry_filter?: number; 
      location_filter?: number 
    }) => ["reports", "job-performance", params] as const,
    exportReport: (params?: { 
      report_type?: string; 
      format?: string; 
      date_range?: { start: string; end: string }; 
      filters?: Record<string, string | number | boolean>; 
      include_details?: boolean 
    }) => ["reports", "export", params] as const,
  },
  files: {
    all: ["files"] as const,
    detail: (bucket: string, path: string) => [...QUERY_KEYS.files.all, "detail", bucket, path] as const,
    url: (bucket: string, path: string, expiresIn?: number) => [...QUERY_KEYS.files.all, "url", bucket, path, expiresIn] as const,
  },
  search: {
    all: ["search"] as const,
    global: (params?: { query?: string; limit?: number; type?: string }) => [...QUERY_KEYS.search.all, "global", params] as const,
    advancedJobs: (params?: { 
      query?: string; 
      industry_id?: number; 
      location_id?: number; 
      company_id?: number; 
      employment_type?: string; 
      experience_level?: string; 
      salary_min?: number; 
      salary_max?: number; 
      is_remote?: boolean; 
      is_featured?: boolean; 
      skills?: string[]; 
      posted_within_days?: number; 
      page?: number; 
      limit?: number; 
      sort_by?: string; 
      sort_order?: string 
    }) => [...QUERY_KEYS.search.all, "advanced-jobs", params] as const,
    suggestions: (params?: { query?: string; limit?: number; type?: string }) => [...QUERY_KEYS.search.all, "suggestions", params] as const,
    savedSearches: (params?: { page?: number; limit?: number; sort_by?: string; sort_order?: string }) => [...QUERY_KEYS.search.all, "saved-searches", params] as const,
  },
} as const; 