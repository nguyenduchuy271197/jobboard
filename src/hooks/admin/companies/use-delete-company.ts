import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompany } from "@/actions/admin/companies/delete-company";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      // Invalidate and refetch company-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.companies.all() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.all() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all });
    },
  });
} 