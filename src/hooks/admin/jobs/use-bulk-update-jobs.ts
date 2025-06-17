import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bulkUpdateJobs } from "@/actions/admin/jobs/bulk-update-jobs";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useBulkUpdateJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateJobs,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch admin jobs queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.all() });
        
        // Invalidate pending jobs
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.pending() });
        
        // Update statistics
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.statistics() });
        
        // Invalidate main jobs list
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all });
        
        const { updated, failed } = result.data;
        if (failed > 0) {
          toast.success(`Cập nhật thành công ${updated} công việc, thất bại ${failed} công việc`);
        } else {
          toast.success(`Cập nhật thành công ${updated} công việc`);
        }
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật hàng loạt");
    },
  });
} 