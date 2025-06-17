"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createApplication } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { CreateJobApplicationData } from "@/types/custom.types";

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateJobApplicationData) => {
      const result = await createApplication(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (newApplication) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applications.all,
      });

      // Add the new application to user applications cache
      queryClient.setQueryData(
        QUERY_KEYS.applications.userApplications(newApplication.applicant_id),
        (oldData: typeof newApplication[] | undefined) => {
          if (!oldData) return [newApplication];
          return [newApplication, ...oldData];
        }
      );

      // Invalidate job applications for the specific job
      if (newApplication.job_id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.applications.jobApplications(newApplication.job_id),
        });
      }

      // Invalidate company applications if we have company info
      if (newApplication.job?.company?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.applications.companyApplications(newApplication.job.company.id),
        });
      }
    },
    onError: (error) => {
      console.error("Lỗi khi tạo hồ sơ ứng tuyển:", error);
    },
  });
} 