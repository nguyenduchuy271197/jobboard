import { useQuery } from "@tanstack/react-query";
import { getPendingCompanies } from "@/actions/admin/companies/get-pending-companies";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UsePendingCompaniesParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export function usePendingCompanies(params: UsePendingCompaniesParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.companies.pending(),
    queryFn: () => getPendingCompanies({
      ...params,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
} 