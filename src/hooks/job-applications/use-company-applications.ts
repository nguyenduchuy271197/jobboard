"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyApplications } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCompanyApplications(companyId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.applications.companyApplications(companyId),
    queryFn: async () => {
      const result = await getCompanyApplications(companyId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!companyId && companyId > 0,
    retry: (failureCount, error) => {
      // Don't retry on not found or unauthorized errors
      if (error.message === "Công ty không tồn tại" || error.message === "Bạn không có quyền xem hồ sơ ứng tuyển của công ty này") {
        return false;
      }
      return failureCount < 3;
    },
  });
} 