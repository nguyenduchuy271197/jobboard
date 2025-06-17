import { useQuery } from "@tanstack/react-query";
import { getFile } from "@/actions/files/get-file";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { FileBucket } from "@/types/custom.types";

type UseFileParams = {
  bucket: FileBucket;
  path: string;
  enabled?: boolean;
};

export function useFile({ bucket, path, enabled = true }: UseFileParams) {
  return useQuery({
    queryKey: QUERY_KEYS.files.detail(bucket, path),
    queryFn: () => getFile({ bucket, path }),
    enabled: enabled && !!bucket && !!path,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 