"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteResume } from "@/actions/job-seeker-profiles/delete-resume";
import { QUERY_KEYS } from "@/lib/query-keys";
import { JobSeekerProfile } from "@/types/custom.types";

export function useDeleteResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteResume();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: () => {
      // Update current profile cache to remove CV path
      queryClient.setQueryData(
        QUERY_KEYS.jobSeekerProfiles.current(),
        (oldData: JobSeekerProfile | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, cv_file_path: null };
        }
      );
      
      // Update profile detail cache if it exists
      const currentProfile = queryClient.getQueryData<JobSeekerProfile>(
        QUERY_KEYS.jobSeekerProfiles.current()
      );
      
      if (currentProfile) {
        queryClient.setQueryData(
          QUERY_KEYS.jobSeekerProfiles.detail(currentProfile.user_id),
          (oldData: JobSeekerProfile | undefined) => {
            if (!oldData) return oldData;
            return { ...oldData, cv_file_path: null };
          }
        );
      }
    },
    onError: (error: Error) => {
      console.error("Failed to delete resume:", error.message);
    },
  });
} 