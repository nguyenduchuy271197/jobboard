import { useQuery } from "@tanstack/react-query";
import { getAllCompanies } from "@/actions/admin/companies/get-all-companies";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseAllCompaniesParams {
  search?: string;
  industry_id?: number;
  location_id?: number;
  is_verified?: boolean;
  limit?: number;
  offset?: number;
}

export function useAllCompanies(params: UseAllCompaniesParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admin.companies.list(params),
    queryFn: () => getAllCompanies({
      ...params,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 