import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { AuthUser } from "@/types/custom.types";

export function useUser() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.currentUser(),
    queryFn: async (): Promise<AuthUser | null> => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }
      
      return user;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 