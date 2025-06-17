import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { archiveJob } from "@/actions/admin/jobs/archive-job";

export function useArchiveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: number) => archiveJob({ job_id: jobId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job-statistics"] });
      toast.success("Công việc đã được lưu trữ thành công");
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi lưu trữ công việc: ${error.message}`);
    },
  });
} 