"use client";

import { useQuery } from "@tanstack/react-query";
import { getJobApplication } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useJobApplication(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.applications.detail(id),
    queryFn: async () => {
      const result = await getJobApplication(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id && id > 0,
    retry: (failureCount, error) => {
      // Don't retry on not found or unauthorized errors
      if (error.message === "Hồ sơ ứng tuyển không tồn tại" || error.message === "Vui lòng đăng nhập để thực hiện thao tác này") {
        return false;
      }
      return failureCount < 3;
    },
  });
} 