"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUserRole() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.currentUser(),
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      
      if (error || !user) return null;

      // Get profile with role from database
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role || "job_seeker";
      
      return {
        user,
        role,
        isAdmin: role === "admin",
        isEmployer: role === "employer",
        isJobSeeker: role === "job_seeker",
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
} 