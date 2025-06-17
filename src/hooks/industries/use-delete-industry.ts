import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIndustry } from "@/actions/industries/delete-industry";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Industry } from "@/types/custom.types";

interface IndustryQueryData {
  success: boolean;
  data?: Industry[];
}

export function useDeleteIndustry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIndustry,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches for industry lists
      await queryClient.cancelQueries({ 
        queryKey: QUERY_KEYS.industries.lists() 
      });

      // Optimistically remove the industry from lists
      queryClient.setQueriesData(
        { queryKey: QUERY_KEYS.industries.lists() },
        (oldData: IndustryQueryData | undefined) => {
          if (!oldData?.success || !oldData?.data) return oldData;
          
          return {
            ...oldData,
            data: oldData.data.filter((industry: Industry) => industry.id !== variables.id)
          };
        }
      );

      // Return context for rollback
      return { deletedIndustryId: variables.id };
    },
    onError: () => {
      // On error, invalidate to refetch the accurate data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.industries.lists(),
      });
    },
    onSuccess: (data, variables) => {
      // Remove the specific industry from cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.industries.detail(variables.id),
      });
    },
    onSettled: () => {
      // Always refetch industry lists to ensure consistency
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.industries.lists(),
      });
    },
  });
} 