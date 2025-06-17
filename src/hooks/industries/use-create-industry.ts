import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIndustry } from "@/actions/industries/create-industry";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCreateIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIndustry,
    onSuccess: () => {
      // Invalidate all industry queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.industries.all,
      });
    },
    onError: (error) => {
      console.error("Failed to create industry:", error);
    },
  });
} 