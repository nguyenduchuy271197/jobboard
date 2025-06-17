"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser } from "@/actions/auth/login";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      // Invalidate auth and user queries after successful login
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
  });
} 