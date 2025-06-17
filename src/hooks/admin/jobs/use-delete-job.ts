import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteJob } from "@/actions/admin/jobs/delete-job";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJob,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate and refetch admin jobs queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.all() });
        
        // Update statistics
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.jobs.statistics() });
        
        // Invalidate main jobs list
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jobs.all });
        
        toast.success("Xóa công việc thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi xóa công việc");
    },
  });
} 