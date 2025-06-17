import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLocation } from "@/actions/locations/update-location";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLocation,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ 
        queryKey: QUERY_KEYS.locations.detail(variables.id) 
      });

      // Snapshot the previous value
      const previousLocation = queryClient.getQueryData(
        QUERY_KEYS.locations.detail(variables.id)
      );

      // Optimistically update to the new value
      if (previousLocation) {
        queryClient.setQueryData(
          QUERY_KEYS.locations.detail(variables.id),
          { ...previousLocation, ...variables }
        );
      }

      // Return a context object with the snapshotted value
      return { previousLocation };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLocation) {
        queryClient.setQueryData(
          QUERY_KEYS.locations.detail(variables.id),
          context.previousLocation
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.locations.detail(variables.id),
      });
      // Invalidate list queries to ensure consistency
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.locations.lists(),
      });
    },
  });
} 