import { useMutation } from "@tanstack/react-query";
import { exportCompanies } from "@/actions/admin/companies/export-companies";

interface ExportCompaniesParams {
  format: "csv" | "json";
  include_unverified?: boolean;
  industry_filter?: number;
  location_filter?: number;
  date_range?: {
    start: string;
    end: string;
  };
}

export function useExportCompanies() {
  return useMutation({
    mutationFn: (params: ExportCompaniesParams) => exportCompanies({
      ...params,
      include_unverified: params.include_unverified ?? false,
    }),
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Create and trigger download
        const blob = new Blob([result.data.content], { 
          type: result.data.mimeType 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    },
  });
} 