"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateJobSeekerProfile } from "@/actions/job-seeker-profiles";
import { QUERY_KEYS } from "@/lib/query-keys";
import { JobSeekerProfile } from "@/types/custom.types";

interface UpdateJobSeekerProfileParams {
  headline?: string;
  summary?: string;
  skills?: string[];
  experience_level?: "entry_level" | "mid_level" | "senior_level" | "executive";
  preferred_location_id?: number;
  preferred_salary_min?: number;
  preferred_salary_max?: number;
  is_looking_for_job?: boolean;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
}

export function useUpdateJobSeekerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateJobSeekerProfileParams) => {
      const result = await updateJobSeekerProfile(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onMutate: async (variables: UpdateJobSeekerProfileParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.current() });
      
      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<JobSeekerProfile>(
        QUERY_KEYS.jobSeekerProfiles.current()
      );
      
      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData(
          QUERY_KEYS.jobSeekerProfiles.current(),
          { ...previousProfile, ...variables }
        );
        
        queryClient.setQueryData(
          QUERY_KEYS.jobSeekerProfiles.detail(previousProfile.user_id),
          { ...previousProfile, ...variables }
        );
      }
      
      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onSuccess: (updatedProfile: JobSeekerProfile) => {
      // Update current profile cache
      queryClient.setQueryData(
        QUERY_KEYS.jobSeekerProfiles.current(),
        updatedProfile
      );
      
      // Update profile detail cache
      queryClient.setQueryData(
        QUERY_KEYS.jobSeekerProfiles.detail(updatedProfile.user_id),
        updatedProfile
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.lists() });
    },
    onError: (error: Error, variables: UpdateJobSeekerProfileParams, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfile) {
        queryClient.setQueryData(
          QUERY_KEYS.jobSeekerProfiles.current(),
          context.previousProfile
        );
        
        queryClient.setQueryData(
          QUERY_KEYS.jobSeekerProfiles.detail(context.previousProfile.user_id),
          context.previousProfile
        );
      }
      console.error("Failed to update job seeker profile:", error.message);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.current() });
    },
  });
} 