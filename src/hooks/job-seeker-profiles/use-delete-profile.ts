"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJobSeekerProfile } from "@/actions/job-seeker-profiles";
import { QUERY_KEYS } from "@/lib/query-keys";
import { JobSeekerProfile } from "@/types/custom.types";

export function useDeleteJobSeekerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteJobSeekerProfile();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.current() });
      
      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<JobSeekerProfile>(
        QUERY_KEYS.jobSeekerProfiles.current()
      );
      
      // Return a context object with the snapshotted values
      return { previousProfile };
    },
    onSuccess: (data: { user_id: string }) => {
      // Remove from query cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.current() });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.detail(data.user_id) });
      
      // Invalidate all profile lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.lists() });
    },
    onError: (error: Error, variables, context) => {
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
      console.error("Failed to delete job seeker profile:", error.message);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobSeekerProfiles.all });
    },
  });
} 