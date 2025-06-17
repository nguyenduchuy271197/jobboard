"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateApplicationStatus } from "@/actions/job-applications";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { DatabaseJobApplication } from "@/types/custom.types";

type UpdateApplicationStatusData = {
  id: number;
  status: "pending" | "reviewing" | "interviewing" | "accepted" | "rejected" | "withdrawn";
  notes?: string;
};

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateApplicationStatusData) => {
      const result = await updateApplicationStatus(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.applications.detail(variables.id) });

      // Snapshot the previous value
      const previousApplication = queryClient.getQueryData<DatabaseJobApplication>(
        QUERY_KEYS.applications.detail(variables.id)
      );

      // Optimistically update to the new value
      if (previousApplication) {
        queryClient.setQueryData<DatabaseJobApplication>(
          QUERY_KEYS.applications.detail(variables.id),
          {
            ...previousApplication,
            status: variables.status,
            notes: variables.notes || null,
            status_updated_at: new Date().toISOString(),
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previousApplication };
    },
    onSuccess: (updatedApplication) => {
      // Update the specific application cache
      queryClient.setQueryData(
        QUERY_KEYS.applications.detail(updatedApplication.id),
        updatedApplication
      );

      // Update applications lists
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applications.lists(),
      });

      // Update user applications cache if it exists
      if (updatedApplication.applicant_id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.applications.userApplications(updatedApplication.applicant_id),
        });
      }

      // Update job applications cache
      if (updatedApplication.job_id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.applications.jobApplications(updatedApplication.job_id),
        });
      }

      // Update company applications cache
      if (updatedApplication.job?.company?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.applications.companyApplications(updatedApplication.job.company.id),
        });
      }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousApplication) {
        queryClient.setQueryData(
          QUERY_KEYS.applications.detail(variables.id),
          context.previousApplication
        );
      }
      console.error("Lỗi khi cập nhật trạng thái hồ sơ ứng tuyển:", error);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.applications.detail(variables.id) });
    },
  });
}