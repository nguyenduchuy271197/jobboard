"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJob } from "@/actions/jobs";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Job } from "@/types/custom.types";

interface UpdateJobParams {
  id: number;
  title?: string;
  description?: string;
  requirements?: string;
  industry_id?: number;
  location_id?: number;
  employment_type?: "full_time" | "part_time" | "contract" | "freelance" | "internship";
  experience_level?: "entry_level" | "mid_level" | "senior_level" | "executive";
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  application_deadline?: string;
  status?: "draft" | "pending_approval" | "published" | "closed" | "archived";
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateJobParams) => {
      const result = await updateJob(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onMutate: async (variables: UpdateJobParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.jobs.detail(variables.id) });
      
      // Snapshot the previous value
      const previousJob = queryClient.getQueryData<Job>(
        QUERY_KEYS.jobs.detail(variables.id)
      );
      
      // Optimistically update to the new value
      if (previousJob) {
        queryClient.setQueryData(
          QUERY_KEYS.jobs.detail(variables.id),
          { ...previousJob, ...variables }
        );
      }
      
      // Return a context object with the snapshotted value
      return { previousJob };
    },
    onSuccess: (updatedJob: Job) => {
      // Update job detail cache
      queryClient.setQueryData(
        QUERY_KEYS.jobs.detail(updatedJob.id),
        updatedJob
      );
      
      // Update company jobs cache
      queryClient.setQueryData(
        QUERY_KEYS.jobs.companyJobs(updatedJob.company_id),
        (oldData: Job[] | undefined) => {
          if (!oldData) return [updatedJob];
          return oldData.map((job) =>
            job.id === updatedJob.id ? updatedJob : job
          );
        }
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.lists() });
    },
    onError: (error: Error, variables: UpdateJobParams, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJob) {
        queryClient.setQueryData(
          QUERY_KEYS.jobs.detail(variables.id),
          context.previousJob
        );
      }
      console.error("Failed to update job:", error.message);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.detail(variables.id) });
    },
  });
} 