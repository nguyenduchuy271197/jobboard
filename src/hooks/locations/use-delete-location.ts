import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLocation } from "@/actions/locations/delete-location";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Location } from "@/types/custom.types";

interface LocationQueryData {
  success: boolean;
  data?: Location[];
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLocation,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for location lists
      await queryClient.cancelQueries({ 
        queryKey: QUERY_KEYS.locations.lists() 
      });

      // Optimistically remove the location from lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.locations.lists() },
        (oldData: LocationQueryData | undefined) => {
          if (!oldData?.success || !oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.filter((location: Location) => location.id !== variables.id)
          };
        }
      );

      // Return context for rollback
      return { deletedLocationId: variables.id };
    },
    onError: () => {
      // On error, invalidate to refetch the accurate data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.locations.lists(),
      });
    },
    onSuccess: (data, variables) => {
      // Remove the specific location from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.locations.detail(variables.id),
      });
    },
    onSettled: () => {
      // Always refetch location lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.locations.lists(),
      });
    },
  });
} 