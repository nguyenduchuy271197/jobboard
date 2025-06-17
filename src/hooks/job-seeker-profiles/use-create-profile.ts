"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJobSeekerProfile } from "@/actions/job-seeker-profiles";
import { QUERY_KEYS } from "@/lib/query-keys";
import { JobSeekerProfile } from "@/types/custom.types";

interface CreateJobSeekerProfileParams {
  headline: string;
  summary: string;
  skills: string[];
  experience_level: "entry_level" | "mid_level" | "senior_level" | "executive";
  preferred_location_id?: number;
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  is_looking_for_job?: boolean;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
}

export function useCreateJobSeekerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateJobSeekerProfileParams) => {
      const result = await createJobSeekerProfile(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: (newProfile: JobSeekerProfile) => {
      // Set current profile cache
      queryClient.setQueryData(
        QUERY_KEYS.jobSeekerProfiles.current(),
        newProfile
      );
      
      // Set profile detail cache
      queryClient.setQueryData(
        QUERY_KEYS.jobSeekerProfiles.detail(newProfile.user_id),
        newProfile
      );
      
      // Invalidate and refetch profile lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.all });
    },
    onError: (error: Error) => {
      console.error("Failed to create job seeker profile:", error.message);
    },
  });
} 