"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompany } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Company } from "@/types/custom.types";

interface DeleteCompanyParams {
  id: number;
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteCompanyParams) => {
      const result = await deleteCompany(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onMutate: async (variables: DeleteCompanyParams) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.companies.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.companies.userCompanies() });
      
      // Snapshot the previous value
      const previousCompany = queryClient.getQueryData<Company>(
        QUERY_KEYS.companies.detail(variables.id)
      );
      const previousUserCompanies = queryClient.getQueryData<Company[]>(
        QUERY_KEYS.companies.userCompanies()
      );
      
      // Optimistically remove from lists
      if (previousUserCompanies) {
        queryClient.setQueryData(
          QUERY_KEYS.companies.userCompanies(),
          previousUserCompanies.filter((company) => company.id !== variables.id)
        );
      }
      
      // Return a context object with the snapshotted values
      return { previousCompany, previousUserCompanies };
    },
    onSuccess: (data: { id: number }) => {
      // Remove from query cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.companies.detail(data.id) });
      
      // Invalidate all company lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.lists() });
    },
    onError: (error: Error, variables: DeleteCompanyParams, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUserCompanies) {
        queryClient.setQueryData(
          QUERY_KEYS.companies.userCompanies(),
          context.previousUserCompanies
        );
      }
      if (context?.previousCompany) {
        queryClient.setQueryData(
          QUERY_KEYS.companies.detail(variables.id),
          context.previousCompany
        );
      }
      console.error("Failed to delete company:", error.message);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.userCompanies() });
    },
  });
} 