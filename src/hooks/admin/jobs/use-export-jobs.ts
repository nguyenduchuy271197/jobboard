import { useMutation } from "@tanstack/react-query";
import { exportJobs } from "@/actions/admin/jobs/export-jobs";
import { toast } from "sonner";

export function useExportJobs() {
  return useMutation({
    mutationFn: exportJobs,
    onSuccess: (result) => {
      if (result.success) {
        // Tạo và download file
        const blob = new Blob([result.data.content], { 
          type: result.data.mime_type 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success("Xuất dữ liệu công việc thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xuất dữ liệu công việc");
    },
  });
} 