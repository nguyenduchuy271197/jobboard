"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "@/actions/jobs";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Job } from "@/types/custom.types";

interface CreateJobParams {
  company_id: number;
  title: string;
  description: string;
  requirements: string;
  industry_id?: number;
  location_id?: number;
  employment_type: "full_time" | "part_time" | "contract" | "freelance" | "internship";
  experience_level: "entry_level" | "mid_level" | "senior_level" | "executive";
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  application_deadline?: string;
  status?: "draft" | "pending_approval" | "published" | "closed" | "archived";
}

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateJobParams) => {
      const result = await createJob(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: (newJob: Job) => {
      // Invalidate and refetch job lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all });
      
      // Add new job to company jobs cache
      queryClient.setQueryData(
        QUERY_KEYS.jobs.companyJobs(newJob.company_id),
        (oldData: Job[] | undefined) => {
          if (!oldData) return [newJob];
          return [newJob, ...oldData];
        }
      );
    },
    onError: (error: Error) => {
      console.error("Failed to create job:", error.message);
    },
  });
} 