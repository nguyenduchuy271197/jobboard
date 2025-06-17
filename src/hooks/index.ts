// Auth hooks
export * from "./auth";

// User hooks
export * from "./users";

// Location hooks
export * from "./locations";

// Industry hooks
export * from "./industries";

// Company hooks
export * from "./companies";

// Job hooks
export * from "./jobs";

// Job Seeker Profile hooks
export * from "./job-seeker-profiles";

// Job Application hooks
export * from "./job-applications";

// Existing hooks
export * from "./use-mobile";

// Admin hooks
export { 
  useAllCompanies as useAllCompaniesAdmin,
  usePendingCompanies,
  useCompanyStatistics,
  useVerifyCompany,
  useRejectCompany,
  useDeleteCompany as useDeleteCompanyAdmin,
  useExportCompanies 
} from "./admin/companies";
export { 
  useAllJobs as useAllJobsAdmin,
  usePendingJobs,
  useJobStatistics,
  useApproveJob,
  useRejectJob,
  useArchiveJob,
  useDeleteJob as useDeleteJobAdmin,
  useBulkUpdateJobs,
  useExportJobs 
} from "./admin/jobs";
export {
  useAllUsers as useAllUsersAdmin,
  useUserDetails,
  useUserStatistics,
  useUpdateUserRole,
  useActivateUser,
  useDeactivateUser,
  useExportUsers
} from "./admin/users";

// Dashboard hooks
export * from "./dashboard";

// Reports hooks
export * from "./reports";

// File management hooks
export * from "./files";

// Search & Filtering hooks
export * from "./search"; 