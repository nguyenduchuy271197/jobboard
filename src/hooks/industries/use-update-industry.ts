import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIndustry } from "@/actions/industries/update-industry";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUpdateIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIndustry,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ 
        queryKey: QUERY_KEYS.industries.detail(variables.id) 
      });

      // Snapshot the previous value
      const previousIndustry = queryClient.getQueryData(
        QUERY_KEYS.industries.detail(variables.id)
      );

      // Optimistically update to the new value
      if (previousIndustry) {
        queryClient.setQueryData(
          QUERY_KEYS.industries.detail(variables.id),
          { ...previousIndustry, ...variables }
        );
      }

      // Return a context object with the snapshotted value
      return { previousIndustry };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousIndustry) {
        queryClient.setQueryData(
          QUERY_KEYS.industries.detail(variables.id),
          context.previousIndustry
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.industries.detail(variables.id),
      });
      // Invalidate list queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.industries.lists(),
      });
    },
  });
} 