"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadAvatar } from "@/actions/users/upload-avatar";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (result) => {
      if (result.success) {
        // Update the cached profile data with new avatar
        queryClient.setQueryData(QUERY_KEYS.users.currentProfile(), result.data.profile);
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      }
    },
  });
} 