"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile } from "@/actions/users/update-profile";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (result) => {
      if (result.success) {
        // Update the cached profile data
        queryClient.setQueryData(QUERY_KEYS.users.currentProfile(), result.data);
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      }
    },
  });
} 