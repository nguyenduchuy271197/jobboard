import { useQuery } from "@tanstack/react-query";
import { getFileUrl } from "@/actions/files/get-file-url";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { FileBucket } from "@/types/custom.types";

type UseFileUrlParams = {
  bucket: FileBucket;
  path: string;
  expiresIn?: number;
  enabled?: boolean;
};

export function useFileUrl({ bucket, path, expiresIn = 3600, enabled = true }: UseFileUrlParams) {
  return useQuery({
    queryKey: QUERY_KEYS.files.url(bucket, path, expiresIn),
    queryFn: () => getFileUrl({ bucket, path, expiresIn }),
    enabled: enabled && !!bucket && !!path,
    staleTime: expiresIn ? (expiresIn - 300) * 1000 : 1000 * 60 * 55, // Refresh 5 minutes before expiry
  });
} 