"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyCompany } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Company } from "@/types/custom.types";

interface VerifyCompanyParams {
  company_id: number;
  is_verified: boolean;
}

export function useVerifyCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VerifyCompanyParams) => {
      const result = await verifyCompany(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onMutate: async (variables: VerifyCompanyParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.companies.detail(variables.company_id) });
      
      // Snapshot the previous value
      const previousCompany = queryClient.getQueryData<Company>(
        QUERY_KEYS.companies.detail(variables.company_id)
      );
      
      // Optimistically update to the new value
      if (previousCompany) {
        queryClient.setQueryData(
          QUERY_KEYS.companies.detail(variables.company_id),
          { ...previousCompany, is_verified: variables.is_verified }
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
      
      // Invalidate all lists to ensure verification status is reflected
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.lists() });
    },
    onError: (error: Error, variables: VerifyCompanyParams, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCompany) {
        queryClient.setQueryData(
          QUERY_KEYS.companies.detail(variables.company_id),
          context.previousCompany
        );
      }
      console.error("Failed to verify company:", error.message);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.detail(variables.company_id) });
    },
  });
} 