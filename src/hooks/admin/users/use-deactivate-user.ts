import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateUser } from "@/actions/admin/users/deactivate-user";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate and refetch admin users queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admin.users.all() });
        
        // Invalidate specific user details
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.admin.users.detail(variables.user_id) 
        });
        
        // Update user statistics
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.admin.users.statistics() 
        });
        
        toast.success("Vô hiệu hóa tài khoản thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi vô hiệu hóa tài khoản");
    },
  });
} 