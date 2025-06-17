import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectJob } from "@/actions/admin/jobs/reject-job";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useRejectJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectJob,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch admin jobs queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.all() });
        
        // Invalidate pending jobs
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.pending() });
        
        // Update statistics
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.statistics() });
        
        toast.success("Từ chối công việc thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi từ chối công việc");
    },
  });
} 