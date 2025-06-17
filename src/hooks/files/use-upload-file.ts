import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile } from "@/actions/files/upload-file";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate file-related queries
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.files.all });
        
        // You can add more specific invalidations based on bucket type
        // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profiles.all });
        // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.companies.all });
      }
    },
  });
} 