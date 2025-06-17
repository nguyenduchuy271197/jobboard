"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadResume } from "@/actions/job-seeker-profiles";
import { QUERY_KEYS } from "@/lib/query-keys";
import { JobSeekerProfile } from "@/types/custom.types";

interface UploadResumeParams {
  formData: FormData;
}

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadResumeParams) => {
      const result = await uploadResume(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: (data: { cv_file_path: string }) => {
      // Update current profile cache with new CV file path
      queryClient.setQueryData(
        QUERY_KEYS.jobSeekerProfiles.current(),
        (oldData: JobSeekerProfile | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, cv_file_path: data.cv_file_path };
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
            return { ...oldData, cv_file_path: data.cv_file_path };
          }
        );
      }
    },
    onError: (error: Error) => {
      console.error("Failed to upload resume:", error.message);
    },
  });
} 