import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocation } from "@/actions/locations/create-location";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      // Invalidate all location queries to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.locations.all,
      });
    },
    onError: (error) => {
      console.error("Failed to create location:", error);
    },
  });
} 