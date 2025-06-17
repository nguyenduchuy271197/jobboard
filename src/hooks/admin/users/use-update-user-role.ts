import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserRole } from "@/actions/admin/users/update-user-role";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate and refetch admin users queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users.all() });
        
        // Invalidate specific user details
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.admin.users.detail(variables.user_id) 
        });
        
        toast.success("Cập nhật vai trò thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi cập nhật vai trò");
    },
  });
} 