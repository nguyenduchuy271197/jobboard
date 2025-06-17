# Job Board - Complete Actions & Hooks Implementation

Dựa trên Database Schema và Functional Requirements cho MVP Job Board

---

## 🔐 **Authentication & Users**

| Feature        | Action                                          | Hook                          | Type     | Priority   | Dependencies |
| -------------- | ----------------------------------------------- | ----------------------------- | -------- | ---------- | ------------ |
| Register       | `auth/register.ts` → `registerUser`             | `auth/use-register.ts`        | Mutation | Cao        | None         |
| Login          | `auth/login.ts` → `loginUser`                   | `auth/use-login.ts`           | Mutation | Cao        | FR01         |
| Logout         | `auth/logout.ts` → `logoutUser`                 | `auth/use-logout.ts`          | Mutation | Cao        | FR02         |
| Get Profile    | `users/get-profile.ts` → `getUserProfile`       | `users/use-profile.ts`        | Query    | Cao        | FR02         |
| Update Profile | `users/update-profile.ts` → `updateUserProfile` | `users/use-update-profile.ts` | Mutation | Cao        | FR03         |
| Upload Avatar  | `users/upload-avatar.ts` → `uploadAvatar`       | `users/use-upload-avatar.ts`  | Mutation | Trung bình | FR03         |
| Change Role    | `users/change-role.ts` → `changeUserRole`       | `users/use-change-role.ts`    | Mutation | Thấp       | Admin only   |

---

## 📍 **Locations Management**

| Feature         | Action                                            | Hook                               | Type     | Priority | Dependencies |
| --------------- | ------------------------------------------------- | ---------------------------------- | -------- | -------- | ------------ |
| Get Locations   | `locations/get-locations.ts` → `getLocations`     | `locations/use-locations.ts`       | Query    | Cao      | None         |
| Create Location | `locations/create-location.ts` → `createLocation` | `locations/use-create-location.ts` | Mutation | Thấp     | Admin only   |
| Update Location | `locations/update-location.ts` → `updateLocation` | `locations/use-update-location.ts` | Mutation | Thấp     | Admin only   |
| Delete Location | `locations/delete-location.ts` → `deleteLocation` | `locations/use-delete-location.ts` | Mutation | Thấp     | Admin only   |

---

## 🏭 **Industries Management**

| Feature         | Action                                             | Hook                                | Type     | Priority | Dependencies |
| --------------- | -------------------------------------------------- | ----------------------------------- | -------- | -------- | ------------ |
| Get Industries  | `industries/get-industries.ts` → `getIndustries`   | `industries/use-industries.ts`      | Query    | Cao      | None         |
| Create Industry | `industries/create-industry.ts` → `createIndustry` | `industries/use-create-industry.ts` | Mutation | Cao      | Admin only   |
| Update Industry | `industries/update-industry.ts` → `updateIndustry` | `industries/use-update-industry.ts` | Mutation | Cao      | Admin only   |
| Delete Industry | `industries/delete-industry.ts` → `deleteIndustry` | `industries/use-delete-industry.ts` | Mutation | Cao      | Admin only   |

---

## 🏢 **Companies Management**

| Feature            | Action                                                 | Hook                              | Type     | Priority   | Dependencies |
| ------------------ | ------------------------------------------------------ | --------------------------------- | -------- | ---------- | ------------ |
| Get Companies      | `companies/get-companies.ts` → `getCompanies`          | `companies/use-companies.ts`      | Query    | Cao        | None         |
| Get Company        | `companies/get-company.ts` → `getCompanyDetails`       | `companies/use-company.ts`        | Query    | Cao        | None         |
| Create Company     | `companies/create-company.ts` → `createCompany`        | `companies/use-create-company.ts` | Mutation | Cao        | FR11         |
| Update Company     | `companies/update-company.ts` → `updateCompany`        | `companies/use-update-company.ts` | Mutation | Cao        | FR11         |
| Delete Company     | `companies/delete-company.ts` → `deleteCompany`        | `companies/use-delete-company.ts` | Mutation | Trung bình | FR11         |
| Upload Logo        | `companies/upload-logo.ts` → `uploadCompanyLogo`       | `companies/use-upload-logo.ts`    | Mutation | Trung bình | FR11         |
| Verify Company     | `companies/verify-company.ts` → `verifyCompany`        | `companies/use-verify-company.ts` | Mutation | Trung bình | Admin only   |
| Get User Companies | `companies/get-user-companies.ts` → `getUserCompanies` | `companies/use-user-companies.ts` | Query    | Cao        | FR11         |

---

## 💼 **Jobs Management**

| Feature           | Action                                          | Hook                            | Type     | Priority   | Dependencies |
| ----------------- | ----------------------------------------------- | ------------------------------- | -------- | ---------- | ------------ |
| Get Jobs          | `jobs/get-jobs.ts` → `getJobs`                  | `jobs/use-jobs.ts`              | Query    | Cao        | FR04         |
| Get Job           | `jobs/get-job.ts` → `getJobDetails`             | `jobs/use-job.ts`               | Query    | Cao        | FR05         |
| Search Jobs       | `jobs/search-jobs.ts` → `searchJobs`            | `jobs/use-search-jobs.ts`       | Query    | Cao        | FR06         |
| Create Job        | `jobs/create-job.ts` → `createJob`              | `jobs/use-create-job.ts`        | Mutation | Cao        | FR12         |
| Update Job        | `jobs/update-job.ts` → `updateJob`              | `jobs/use-update-job.ts`        | Mutation | Cao        | FR13         |
| Delete Job        | `jobs/delete-job.ts` → `deleteJob`              | `jobs/use-delete-job.ts`        | Mutation | Cao        | FR13         |
| Update Job Status | `jobs/update-job-status.ts` → `updateJobStatus` | `jobs/use-update-job-status.ts` | Mutation | Cao        | FR13         |
| Get User Jobs     | `jobs/get-user-jobs.ts` → `getUserJobs`         | `jobs/use-user-jobs.ts`         | Query    | Cao        | FR13         |
| Get Featured Jobs | `jobs/get-featured-jobs.ts` → `getFeaturedJobs` | `jobs/use-featured-jobs.ts`     | Query    | Trung bình | FR04         |
| Get Recent Jobs   | `jobs/get-recent-jobs.ts` → `getRecentJobs`     | `jobs/use-recent-jobs.ts`       | Query    | Cao        | FR04         |
| Increment Views   | `jobs/increment-views.ts` → `incrementJobViews` | `jobs/use-increment-views.ts`   | Mutation | Trung bình | FR05         |

---

## 👤 **Job Seeker Profiles**

| Feature                    | Action                                                          | Hook                                   | Type     | Priority   | Dependencies |
| -------------------------- | --------------------------------------------------------------- | -------------------------------------- | -------- | ---------- | ------------ |
| Get Job Seeker Profile     | `job-seekers/get-profile.ts` → `getJobSeekerProfile`            | `job-seekers/use-profile.ts`           | Query    | Cao        | FR07         |
| Create Job Seeker Profile  | `job-seekers/create-profile.ts` → `createJobSeekerProfile`      | `job-seekers/use-create-profile.ts`    | Mutation | Cao        | FR07         |
| Update Job Seeker Profile  | `job-seekers/update-profile.ts` → `updateJobSeekerProfile`      | `job-seekers/use-update-profile.ts`    | Mutation | Cao        | FR07         |
| Delete Job Seeker Profile  | `job-seekers/delete-profile.ts` → `deleteJobSeekerProfile`      | `job-seekers/use-delete-profile.ts`    | Mutation | Trung bình | FR07         |
| Upload CV                  | `job-seekers/upload-cv.ts` → `uploadCV`                         | `job-seekers/use-upload-cv.ts`         | Mutation | Cao        | FR08         |
| Delete CV                  | `job-seekers/delete-cv.ts` → `deleteCV`                         | `job-seekers/use-delete-cv.ts`         | Mutation | Trung bình | FR08         |
| Get Job Seeker Profiles    | `job-seekers/get-profiles.ts` → `getJobSeekerProfiles`          | `job-seekers/use-profiles.ts`          | Query    | Cao        | FR14         |
| Search Job Seeker Profiles | `job-seekers/search-profiles.ts` → `searchJobSeekerProfiles`    | `job-seekers/use-search-profiles.ts`   | Query    | Cao        | FR14         |
| Update Job Status          | `job-seekers/update-job-status.ts` → `updateJobSeekerJobStatus` | `job-seekers/use-update-job-status.ts` | Mutation | Trung bình | FR07         |

---

## 📝 **Applications Management**

| Feature                   | Action                                                          | Hook                                     | Type     | Priority   | Dependencies |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------- | -------- | ---------- | ------------ |
| Get Applications          | `applications/get-applications.ts` → `getApplications`          | `applications/use-applications.ts`       | Query    | Cao        | FR09         |
| Get Application           | `applications/get-application.ts` → `getApplicationDetails`     | `applications/use-application.ts`        | Query    | Cao        | FR09         |
| Create Application        | `applications/create-application.ts` → `createApplication`      | `applications/use-create-application.ts` | Mutation | Cao        | FR09         |
| Update Application        | `applications/update-application.ts` → `updateApplication`      | `applications/use-update-application.ts` | Mutation | Cao        | FR09         |
| Delete Application        | `applications/delete-application.ts` → `deleteApplication`      | `applications/use-delete-application.ts` | Mutation | Cao        | FR09         |
| Update Application Status | `applications/update-status.ts` → `updateApplicationStatus`     | `applications/use-update-status.ts`      | Mutation | Cao        | FR15         |
| Get User Applications     | `applications/get-user-applications.ts` → `getUserApplications` | `applications/use-user-applications.ts`  | Query    | Cao        | FR10         |
| Get Job Applications      | `applications/get-job-applications.ts` → `getJobApplications`   | `applications/use-job-applications.ts`   | Query    | Cao        | FR14         |
| Get Application Stats     | `applications/get-application-stats.ts` → `getApplicationStats` | `applications/use-application-stats.ts`  | Query    | Trung bình | FR14, FR10   |
| Withdraw Application      | `applications/withdraw.ts` → `withdrawApplication`              | `applications/use-withdraw.ts`           | Mutation | Cao        | FR09         |

---

## 📊 **Application Status History**

| Feature                 | Action                                                                  | Hook                                      | Type     | Priority   | Dependencies |
| ----------------------- | ----------------------------------------------------------------------- | ----------------------------------------- | -------- | ---------- | ------------ |
| Get Application History | `application-history/get-history.ts` → `getApplicationHistory`          | `application-history/use-history.ts`      | Query    | Trung bình | FR15         |
| Create History Entry    | `application-history/create-entry.ts` → `createApplicationHistoryEntry` | `application-history/use-create-entry.ts` | Mutation | Thấp       | Auto trigger |

---

## 👑 **Admin - User Management**

| Feature             | Action                                                     | Hook                                  | Type     | Priority   | Dependencies |
| ------------------- | ---------------------------------------------------------- | ------------------------------------- | -------- | ---------- | ------------ |
| Get All Users       | `admin/users/get-all-users.ts` → `getAllUsers`             | `admin/users/use-all-users.ts`        | Query    | Cao        | FR17         |
| Get User Details    | `admin/users/get-user-details.ts` → `getUserDetails`       | `admin/users/use-user-details.ts`     | Query    | Cao        | FR17         |
| Update User Role    | `admin/users/update-user-role.ts` → `updateUserRole`       | `admin/users/use-update-user-role.ts` | Mutation | Cao        | FR17         |
| Deactivate User     | `admin/users/deactivate-user.ts` → `deactivateUser`        | `admin/users/use-deactivate-user.ts`  | Mutation | Cao        | FR17         |
| Activate User       | `admin/users/activate-user.ts` → `activateUser`            | `admin/users/use-activate-user.ts`    | Mutation | Cao        | FR17         |
| Get User Statistics | `admin/users/get-user-statistics.ts` → `getUserStatistics` | `admin/users/use-user-statistics.ts`  | Query    | Trung bình | FR17         |
| Export Users        | `admin/users/export-users.ts` → `exportUsers`              | `admin/users/use-export-users.ts`     | Mutation | Thấp       | FR17         |

---

## 👑 **Admin - Job Management**

| Feature            | Action                                                  | Hook                                 | Type     | Priority   | Dependencies |
| ------------------ | ------------------------------------------------------- | ------------------------------------ | -------- | ---------- | ------------ |
| Get All Jobs       | `admin/jobs/get-all-jobs.ts` → `getAllJobs`             | `admin/jobs/use-all-jobs.ts`         | Query    | Cao        | FR18         |
| Approve Job        | `admin/jobs/approve-job.ts` → `approveJob`              | `admin/jobs/use-approve-job.ts`      | Mutation | Cao        | FR18         |
| Reject Job         | `admin/jobs/reject-job.ts` → `rejectJob`                | `admin/jobs/use-reject-job.ts`       | Mutation | Cao        | FR18         |
| Feature Job        | `admin/jobs/feature-job.ts` → `featureJob`              | `admin/jobs/use-feature-job.ts`      | Mutation | Trung bình | FR18         |
| Archive Job        | `admin/jobs/archive-job.ts` → `archiveJob`              | `admin/jobs/use-archive-job.ts`      | Mutation | Trung bình | FR18         |
| Delete Job         | `admin/jobs/delete-job.ts` → `deleteJob`                | `admin/jobs/use-delete-job.ts`       | Mutation | Cao        | FR18         |
| Get Pending Jobs   | `admin/jobs/get-pending-jobs.ts` → `getPendingJobs`     | `admin/jobs/use-pending-jobs.ts`     | Query    | Cao        | FR18         |
| Get Job Statistics | `admin/jobs/get-job-statistics.ts` → `getJobStatistics` | `admin/jobs/use-job-statistics.ts`   | Query    | Trung bình | FR18         |
| Bulk Update Jobs   | `admin/jobs/bulk-update-jobs.ts` → `bulkUpdateJobs`     | `admin/jobs/use-bulk-update-jobs.ts` | Mutation | Trung bình | FR18         |
| Export Jobs        | `admin/jobs/export-jobs.ts` → `exportJobs`              | `admin/jobs/use-export-jobs.ts`      | Mutation | Thấp       | FR18         |

---

## 👑 **Admin - Company Management**

| Feature                | Action                                                               | Hook                                        | Type     | Priority   | Dependencies |
| ---------------------- | -------------------------------------------------------------------- | ------------------------------------------- | -------- | ---------- | ------------ |
| Get All Companies      | `admin/companies/get-all-companies.ts` → `getAllCompanies`           | `admin/companies/use-all-companies.ts`      | Query    | Cao        | FR17         |
| Verify Company         | `admin/companies/verify-company.ts` → `verifyCompany`                | `admin/companies/use-verify-company.ts`     | Mutation | Cao        | FR17         |
| Reject Company         | `admin/companies/reject-company.ts` → `rejectCompany`                | `admin/companies/use-reject-company.ts`     | Mutation | Cao        | FR17         |
| Delete Company         | `admin/companies/delete-company.ts` → `deleteCompany`                | `admin/companies/use-delete-company.ts`     | Mutation | Trung bình | FR17         |
| Get Pending Companies  | `admin/companies/get-pending-companies.ts` → `getPendingCompanies`   | `admin/companies/use-pending-companies.ts`  | Query    | Cao        | FR17         |
| Get Company Statistics | `admin/companies/get-company-statistics.ts` → `getCompanyStatistics` | `admin/companies/use-company-statistics.ts` | Query    | Trung bình | FR17         |
| Export Companies       | `admin/companies/export-companies.ts` → `exportCompanies`            | `admin/companies/use-export-companies.ts`   | Mutation | Thấp       | FR17         |

---

## 📊 **Dashboard & Analytics**

| Feature              | Action                                                       | Hook                                | Type  | Priority   | Dependencies |
| -------------------- | ------------------------------------------------------------ | ----------------------------------- | ----- | ---------- | ------------ |
| Dashboard Stats      | `dashboard/get-stats.ts` → `getDashboardStats`               | `dashboard/use-stats.ts`            | Query | Cao        | All features |
| Job Seeker Dashboard | `dashboard/get-job-seeker-stats.ts` → `getJobSeekerStats`    | `dashboard/use-job-seeker-stats.ts` | Query | Cao        | FR07, FR10   |
| Employer Dashboard   | `dashboard/get-employer-stats.ts` → `getEmployerStats`       | `dashboard/use-employer-stats.ts`   | Query | Cao        | FR11, FR13   |
| Admin Dashboard      | `dashboard/get-admin-stats.ts` → `getAdminStats`             | `dashboard/use-admin-stats.ts`      | Query | Cao        | All admin    |
| Application Report   | `reports/get-application-report.ts` → `getApplicationReport` | `reports/use-application-report.ts` | Query | Trung bình | FR14, FR15   |
| Job Performance      | `reports/get-job-performance.ts` → `getJobPerformance`       | `reports/use-job-performance.ts`    | Query | Trung bình | FR13         |
| User Activity        | `reports/get-user-activity.ts` → `getUserActivity`           | `reports/use-user-activity.ts`      | Query | Trung bình | All features |
| Popular Industries   | `reports/get-popular-industries.ts` → `getPopularIndustries` | `reports/use-popular-industries.ts` | Query | Trung bình | FR04, FR16   |
| Hiring Trends        | `reports/get-hiring-trends.ts` → `getHiringTrends`           | `reports/use-hiring-trends.ts`      | Query | Trung bình | FR09, FR15   |
| Salary Analytics     | `reports/get-salary-analytics.ts` → `getSalaryAnalytics`     | `reports/use-salary-analytics.ts`   | Query | Thấp       | FR04         |

---

## 📁 **File Management**

| Feature      | Action                                 | Hook                       | Type     | Priority | Dependencies |
| ------------ | -------------------------------------- | -------------------------- | -------- | -------- | ------------ |
| Upload File  | `files/upload-file.ts` → `uploadFile`  | `files/use-upload-file.ts` | Mutation | Cao      | FR08, FR11   |
| Delete File  | `files/delete-file.ts` → `deleteFile`  | `files/use-delete-file.ts` | Mutation | Cao      | FR08, FR11   |
| Get File URL | `files/get-file-url.ts` → `getFileUrl` | `files/use-file-url.ts`    | Query    | Cao      | FR08, FR11   |
| Get File     | `files/get-file.ts` → `getFile`        | `files/use-file.ts`        | Query    | Cao      | FR08, FR14   |

---

## 🔍 **Search & Filtering**

| Feature             | Action                                                | Hook                                | Type     | Priority   | Dependencies |
| ------------------- | ----------------------------------------------------- | ----------------------------------- | -------- | ---------- | ------------ |
| Global Search       | `search/global-search.ts` → `globalSearch`            | `search/use-global-search.ts`       | Query    | Cao        | FR06         |
| Advanced Job Search | `search/advanced-job-search.ts` → `advancedJobSearch` | `search/use-advanced-job-search.ts` | Query    | Cao        | FR06         |
| Search Suggestions  | `search/get-suggestions.ts` → `getSearchSuggestions`  | `search/use-suggestions.ts`         | Query    | Trung bình | FR06         |
| Save Search         | `search/save-search.ts` → `saveSearch`                | `search/use-save-search.ts`         | Mutation | Thấp       | FR06         |
| Get Saved Searches  | `search/get-saved-searches.ts` → `getSavedSearches`   | `search/use-saved-searches.ts`      | Query    | Thấp       | FR06         |


## 🗂️ **Enhanced File Structure**

```
src/
├── actions/
│   ├── auth/
│   │   ├── register.ts
│   │   ├── login.ts
│   │   └── logout.ts
│   ├── users/
│   │   ├── get-profile.ts
│   │   ├── update-profile.ts
│   │   ├── upload-avatar.ts
│   │   └── change-role.ts
│   ├── locations/
│   │   ├── get-locations.ts
│   │   ├── create-location.ts
│   │   ├── update-location.ts
│   │   └── delete-location.ts
│   ├── industries/
│   │   ├── get-industries.ts
│   │   ├── create-industry.ts
│   │   ├── update-industry.ts
│   │   └── delete-industry.ts
│   ├── companies/
│   │   ├── get-companies.ts
│   │   ├── get-company.ts
│   │   ├── create-company.ts
│   │   ├── update-company.ts
│   │   ├── delete-company.ts
│   │   ├── upload-logo.ts
│   │   ├── verify-company.ts
│   │   └── get-user-companies.ts
│   ├── jobs/
│   │   ├── get-jobs.ts
│   │   ├── get-job.ts
│   │   ├── search-jobs.ts
│   │   ├── create-job.ts
│   │   ├── update-job.ts
│   │   ├── delete-job.ts
│   │   ├── update-job-status.ts
│   │   ├── get-user-jobs.ts
│   │   ├── get-featured-jobs.ts
│   │   ├── get-recent-jobs.ts
│   │   └── increment-views.ts
│   ├── job-seekers/
│   │   ├── get-profile.ts
│   │   ├── create-profile.ts
│   │   ├── update-profile.ts
│   │   ├── delete-profile.ts
│   │   ├── upload-cv.ts
│   │   ├── delete-cv.ts
│   │   ├── get-profiles.ts
│   │   ├── search-profiles.ts
│   │   └── update-job-status.ts
│   ├── applications/
│   │   ├── get-applications.ts
│   │   ├── get-application.ts
│   │   ├── create-application.ts
│   │   ├── update-application.ts
│   │   ├── delete-application.ts
│   │   ├── update-status.ts
│   │   ├── get-user-applications.ts
│   │   ├── get-job-applications.ts
│   │   ├── get-application-stats.ts
│   │   └── withdraw.ts
│   ├── application-history/
│   │   ├── get-history.ts
│   │   └── create-entry.ts
│   ├── admin/
│   │   ├── users/
│   │   │   ├── get-all-users.ts
│   │   │   ├── get-user-details.ts
│   │   │   ├── update-user-role.ts
│   │   │   ├── deactivate-user.ts
│   │   │   ├── activate-user.ts
│   │   │   ├── get-user-statistics.ts
│   │   │   └── export-users.ts
│   │   ├── jobs/
│   │   │   ├── get-all-jobs.ts
│   │   │   ├── approve-job.ts
│   │   │   ├── reject-job.ts
│   │   │   ├── feature-job.ts
│   │   │   ├── archive-job.ts
│   │   │   ├── delete-job.ts
│   │   │   ├── get-pending-jobs.ts
│   │   │   ├── get-job-statistics.ts
│   │   │   ├── bulk-update-jobs.ts
│   │   │   └── export-jobs.ts
│   │   └── companies/
│   │       ├── get-all-companies.ts
│   │       ├── verify-company.ts
│   │       ├── reject-company.ts
│   │       ├── delete-company.ts
│   │       ├── get-pending-companies.ts
│   │       ├── get-company-statistics.ts
│   │       └── export-companies.ts
│   ├── dashboard/
│   │   ├── get-stats.ts
│   │   ├── get-job-seeker-stats.ts
│   │   ├── get-employer-stats.ts
│   │   └── get-admin-stats.ts
│   ├── reports/
│   │   ├── get-application-report.ts
│   │   ├── get-job-performance.ts
│   │   ├── get-user-activity.ts
│   │   ├── get-popular-industries.ts
│   │   ├── get-hiring-trends.ts
│   │   └── get-salary-analytics.ts
│   ├── files/
│   │   ├── upload-file.ts
│   │   ├── delete-file.ts
│   │   ├── get-file-url.ts
│   │   └── get-file.ts
│   ├── search/
│   │   ├── global-search.ts
│   │   ├── advanced-job-search.ts
│   │   ├── get-suggestions.ts
│   │   ├── save-search.ts
│   │   └── get-saved-searches.ts
│   └── index.ts
├── hooks/
│   ├── auth/
│   │   ├── use-register.ts
│   │   ├── use-login.ts
│   │   └── use-logout.ts
│   ├── users/
│   │   ├── use-profile.ts
│   │   ├── use-update-profile.ts
│   │   ├── use-upload-avatar.ts
│   │   └── use-change-role.ts
│   ├── locations/
│   │   ├── use-locations.ts
│   │   ├── use-create-location.ts
│   │   ├── use-update-location.ts
│   │   └── use-delete-location.ts
│   ├── industries/
│   │   ├── use-industries.ts
│   │   ├── use-create-industry.ts
│   │   ├── use-update-industry.ts
│   │   └── use-delete-industry.ts
│   ├── companies/
│   │   ├── use-companies.ts
│   │   ├── use-company.ts
│   │   ├── use-create-company.ts
│   │   ├── use-update-company.ts
│   │   ├── use-delete-company.ts
│   │   ├── use-upload-logo.ts
│   │   ├── use-verify-company.ts
│   │   └── use-user-companies.ts
│   ├── jobs/
│   │   ├── use-jobs.ts
│   │   ├── use-job.ts
│   │   ├── use-search-
```
