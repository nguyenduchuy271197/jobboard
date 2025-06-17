import { useMutation } from "@tanstack/react-query";
import { exportReport } from "@/actions/reports/export-report";
import { toast } from "sonner";
import { ExportReportParams } from "@/types/custom.types";

export function useExportReport() {

  return useMutation({
    mutationFn: (params: ExportReportParams) => exportReport({
      ...params,
      include_details: params.include_details ?? false,
    }),
    onSuccess: (result) => {
      if (result.success && result.data) {
        // Create and trigger download
        const blob = new Blob([result.data.file_content], { 
          type: result.data.mime_type 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.data.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success(`Đã xuất báo cáo thành công (${result.data.total_records} bản ghi)`);
      } else {
        toast.error((result as { success: false; error: string }).error || "Không thể xuất báo cáo");
      }
    },
    onError: (error) => {
      console.error("Export report error:", error);
      toast.error("Đã có lỗi xảy ra khi xuất báo cáo");
    },
  });
} 