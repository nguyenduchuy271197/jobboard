"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobApplicationsForJob } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useJobApplicationsForJob(jobId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.applications.jobApplications(jobId),
    queryFn: async () => {
      const result = await getJobApplicationsForJob(jobId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!jobId && jobId > 0,
    retry: (failureCount, error) => {
      // Don't retry on not found or unauthorized errors
      if (error.message === "Công việc không tồn tại" || error.message === "Vui lòng đăng nhập để thực hiện thao tác này") {
        return false;
      }
      return failureCount < 3;
    },
  });
} 