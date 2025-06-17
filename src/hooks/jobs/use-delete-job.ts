"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJob } from "@/actions/jobs";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Job } from "@/types/custom.types";

interface DeleteJobParams {
  id: number;
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteJobParams) => {
      const result = await deleteJob(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onMutate: async (variables: DeleteJobParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.jobs.detail(variables.id) });
      
      // Snapshot the previous value
      const previousJob = queryClient.getQueryData<Job>(
        QUERY_KEYS.jobs.detail(variables.id)
      );
      
      // Optimistically remove from company jobs cache
      if (previousJob) {
        queryClient.setQueryData(
          QUERY_KEYS.jobs.companyJobs(previousJob.company_id),
          (oldData: Job[] | undefined) => {
            if (!oldData) return [];
            return oldData.filter((job) => job.id !== variables.id);
          }
        );
      }
      
      // Return a context object with the snapshotted values
      return { previousJob };
    },
    onSuccess: (data: { id: number }) => {
      // Remove from query cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.jobs.detail(data.id) });
      
      // Invalidate all job lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.lists() });
    },
    onError: (error: Error, variables: DeleteJobParams, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJob) {
        queryClient.setQueryData(
          QUERY_KEYS.jobs.detail(variables.id),
          context.previousJob
        );
        
        // Restore to company jobs cache
        queryClient.setQueryData(
          QUERY_KEYS.jobs.companyJobs(context.previousJob.company_id),
          (oldData: Job[] | undefined) => {
            if (!oldData) return [context.previousJob!];
            // Add back if not already present
            if (!oldData.find(job => job.id === context.previousJob!.id)) {
              return [...oldData, context.previousJob!];
            }
            return oldData;
          }
        );
      }
      console.error("Failed to delete job:", error.message);
    },
    onSettled: (data) => {
      // Always refetch after error or success
      if (data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all });
      }
    },
  });
} 