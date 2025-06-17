import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateUser } from "@/actions/admin/users/activate-user";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
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
        
        toast.success("Kích hoạt tài khoản thành công");
      } else {
        toast.error(result.error);
      }
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi kích hoạt tài khoản");
    },
  });
} 