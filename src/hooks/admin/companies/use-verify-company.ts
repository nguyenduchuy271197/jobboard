import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyCompany } from "@/actions/admin/companies/verify-company";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useVerifyCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyCompany,
    onSuccess: () => {
      // Invalidate and refetch company-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.companies.all() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.all });
    },
  });
} 