"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { JobSeekerProfile } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";

const getJobSeekerProfileSchema = z.object({
  user_id: z.string().uuid("ID người dùng không hợp lệ"),
});

type GetJobSeekerProfileParams = z.infer<typeof getJobSeekerProfileSchema>;
type Result = 
  | { success: true; data: JobSeekerProfile } 
  | { success: false; error: string };

export async function getJobSeekerProfile(params: GetJobSeekerProfileParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getJobSeekerProfileSchema.parse(params);

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Execute query with relations
    const { data: profile, error } = await supabase
      .from("job_seeker_profiles")
      .select(`
        *,
        user:profiles!user_id(id, email, full_name, avatar_url),
        location:locations!preferred_location_id(id, name, slug)
      `)
      .eq("user_id", data.user_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Hồ sơ ứng viên không tồn tại" };
      }
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    if (!profile) {
      return { success: false, error: "Hồ sơ ứng viên không tồn tại" };
    }

    return { success: true, data: profile };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 