import { useQuery } from "@tanstack/react-query";
import { getApplicationReport } from "@/actions/reports/get-application-report";
import { QUERY_KEYS } from "@/lib/query-keys";

interface UseApplicationReportParams {
  date_range?: {
    start: string;
    end: string;
  };
  status_filter?: "pending" | "reviewing" | "interviewing" | "accepted" | "rejected" | "withdrawn";
  industry_filter?: number;
  location_filter?: number;
  company_filter?: number;
  experience_level_filter?: "entry_level" | "mid_level" | "senior_level" | "executive";
}

export function useApplicationReport(params: UseApplicationReportParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.reports.applicationReport(params),
    queryFn: () => getApplicationReport(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
} 