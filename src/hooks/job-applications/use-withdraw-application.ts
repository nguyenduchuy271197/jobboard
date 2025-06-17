"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawApplication } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { DatabaseJobApplication } from "@/types/custom.types";

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const result = await withdrawApplication(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return { id, message: result.message };
    },
    onMutate: async (applicationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.applications.detail(applicationId) });

      // Get the application data before removing it
      const previousApplication = queryClient.getQueryData<DatabaseJobApplication>(
        QUERY_KEYS.applications.detail(applicationId)
      );

      // Remove the application from detail cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.applications.detail(applicationId) });

      // Return a context object with the snapshotted value
      return { previousApplication };
    },
    onSuccess: (data, applicationId) => {
      // Remove from all related queries
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applications.all,
      });

      // Update user applications cache by removing the withdrawn application
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.applications.userApplications() },
        (oldData: DatabaseJobApplication[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.filter((app) => app.id !== applicationId);
        }
      );

      // Invalidate job and company applications
      const previousApplication = queryClient.getQueryData<DatabaseJobApplication>(
        QUERY_KEYS.applications.detail(applicationId)
      );

      if (previousApplication?.job_id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.applications.jobApplications(previousApplication.job_id),
        });
      }

      if (previousApplication?.job?.company?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.applications.companyApplications(previousApplication.job.company.id),
        });
      }
    },
    onError: (error, applicationId, context) => {
      // If the mutation fails, restore the application to the cache
      if (context?.previousApplication) {
        queryClient.setQueryData(
          QUERY_KEYS.applications.detail(applicationId),
          context.previousApplication
        );
      }
      console.error("Lỗi khi rút lại hồ sơ ứng tuyển:", error);
    },
    onSettled: () => {
      // Always refetch applications after mutation
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applications.all,
      });
    },
  });
} 