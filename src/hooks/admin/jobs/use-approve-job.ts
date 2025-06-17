import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveJob } from "@/actions/admin/jobs/approve-job";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useApproveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveJob,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch admin jobs queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.all() });
        
        // Invalidate pending jobs
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.pending() });
        
        // Update statistics
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.statistics() });
        
        toast.success("Phê duyệt công việc thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi phê duyệt công việc");
    },
  });
} 