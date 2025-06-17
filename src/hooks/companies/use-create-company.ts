"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCompany } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Company } from "@/types/custom.types";

interface CreateCompanyParams {
  name: string;
  description?: string;
  website_url?: string;
  industry_id?: number;
  location_id?: number;
  size?: "startup" | "small" | "medium" | "large" | "enterprise";
  address?: string;
  founded_year?: number;
  employee_count?: number;
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateCompanyParams) => {
      const result = await createCompany(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: (newCompany: Company) => {
      // Invalidate and refetch company lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.all });
      
      // Add new company to user companies cache
      queryClient.setQueryData(
        QUERY_KEYS.companies.userCompanies(),
        (oldData: Company[] | undefined) => {
          if (!oldData) return [newCompany];
          return [newCompany, ...oldData];
        }
      );
    },
    onError: (error: Error) => {
      console.error("Failed to create company:", error.message);
    },
  });
} 