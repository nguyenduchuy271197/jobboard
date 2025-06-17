"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUserRole } from "@/actions/users/change-role";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useChangeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeUserRole,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all user queries to refresh any user lists or profiles
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
        
        // If the updated user is the current user, update current profile
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.currentProfile() });
      }
    },
  });
} 