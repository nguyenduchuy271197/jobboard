import { useQuery } from "@tanstack/react-query";
import { getCompanyStatistics } from "@/actions/admin/companies/get-company-statistics";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCompanyStatistics() {
  return useQuery({
    queryKey: QUERY_KEYS.admin.companies.statistics(),
    queryFn: () => getCompanyStatistics(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
  });
} 