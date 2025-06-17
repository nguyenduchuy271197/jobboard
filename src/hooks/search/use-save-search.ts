import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { saveSearch } from "@/actions/search/save-search";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useSaveSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSearch,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.search.savedSearches() });
        toast.success("Đã lưu tìm kiếm thành công");
      } else {
        toast.error(result.error || "Không thể lưu tìm kiếm");
      }
    },
    onError: (error: Error) => {
      toast.error(`Lỗi khi lưu tìm kiếm: ${error.message}`);
    },
  });
} 