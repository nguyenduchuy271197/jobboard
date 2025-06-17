"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompany } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Company } from "@/types/custom.types";

interface UpdateCompanyParams {
  id: number;
  name?: string;
  description?: string;
  website_url?: string;
  industry_id?: number;
  location_id?: number;
  size?: "startup" | "small" | "medium" | "large" | "enterprise";
  address?: string;
  founded_year?: number;
  employee_count?: number;
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateCompanyParams) => {
      const result = await updateCompany(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onMutate: async (variables: UpdateCompanyParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.companies.detail(variables.id) });
      
      // Snapshot the previous value
      const previousCompany = queryClient.getQueryData<Company>(
        QUERY_KEYS.companies.detail(variables.id)
      );
      
      // Optimistically update to the new value
      if (previousCompany) {
        queryClient.setQueryData(
          QUERY_KEYS.companies.detail(variables.id),
          { ...previousCompany, ...variables }
        );
      }
      
      // Return a context object with the snapshotted value
      return { previousCompany };
    },
    onSuccess: (updatedCompany: Company) => {
      // Update company detail cache
      queryClient.setQueryData(
        QUERY_KEYS.companies.detail(updatedCompany.id),
        updatedCompany
      );
      
      // Update lists cache
      queryClient.setQueryData(
        QUERY_KEYS.companies.userCompanies(),
        (oldData: Company[] | undefined) => {
          if (!oldData) return [updatedCompany];
          return oldData.map((company) =>
            company.id === updatedCompany.id ? updatedCompany : company
          );
        }
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.lists() });
    },
    onError: (error: Error, variables: UpdateCompanyParams, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCompany) {
        queryClient.setQueryData(
          QUERY_KEYS.companies.detail(variables.id),
          context.previousCompany
        );
      }
      console.error("Failed to update company:", error.message);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.detail(variables.id) });
    },
  });
} 