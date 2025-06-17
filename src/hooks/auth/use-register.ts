"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser } from "@/actions/auth/register";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      // Invalidate auth queries after successful registration
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
} 