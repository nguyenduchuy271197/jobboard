"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCompanyLogo } from "@/actions/companies";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Company } from "@/types/custom.types";

interface UploadLogoParams {
  company_id: number;
  logo: FormData;
}

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UploadLogoParams) => {
      const result = await uploadCompanyLogo(params);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    onSuccess: (updatedCompany: Company) => {
      // Update company detail cache
      queryClient.setQueryData(
        QUERY_KEYS.companies.detail(updatedCompany.id),
        updatedCompany
      );
      
      // Update user companies cache
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
    onError: (error: Error) => {
      console.error("Failed to upload logo:", error.message);
    },
  });
} 