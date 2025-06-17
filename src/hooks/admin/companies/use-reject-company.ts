import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectCompany } from "@/actions/admin/companies/reject-company";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useRejectCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectCompany,
    onSuccess: () => {
      // Invalidate and refetch company-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.companies.all() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.all });
    },
  });
} 