import { useMutation } from "@tanstack/react-query";
import { exportUsers } from "@/actions/admin/users/export-users";
import { toast } from "sonner";

export function useExportUsers() {
  return useMutation({
    mutationFn: exportUsers,
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
        
        toast.success("Xuất dữ liệu thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xuất dữ liệu");
    },
  });
} 