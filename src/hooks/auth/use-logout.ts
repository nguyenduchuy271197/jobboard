"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutUser } from "@/actions/auth/logout";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear();
    },
  });
} 