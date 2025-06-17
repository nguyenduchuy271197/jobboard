"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";

const paramsSchema = z.object({
  jobId: z.number().positive(),
}).strict();

export async function getJobApplicationsForJob(
  jobId: number
): Promise<{ 
  success: true; 
  data: DatabaseJobApplication[] 
} | { 
  success: false; 
  error: string 
}> {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    const { jobId: validJobId } = paramsSchema.parse({ jobId });

    // First, verify the user owns the job or is authorized
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        id,
                    company:companies (
              id,
              owner_id
            )
      `)
      .eq("id", validJobId)
      .single();

    if (jobError || !job) {
      return { success: false, error: "Công việc không tồn tại" };
    }

    // Check if user owns the company that posted the job
    if (job.company?.owner_id !== user.id) {
      return { success: false, error: "Bạn không có quyền xem hồ sơ ứng tuyển của công việc này" };
    }

    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (
          id,
          title,
          employment_type
        ),
        applicant:profiles!applications_applicant_id_fkey (
          *,
          job_seeker_profile:job_seeker_profiles (
            *,
            preferred_location:locations!job_seeker_profiles_preferred_location_id_fkey (
              *
            )
          )
        )
      `)
      .eq("job_id", validJobId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching job applications:", error);
      return { success: false, error: "Không thể tải danh sách hồ sơ ứng tuyển" };
    }

    return {
      success: true,
      data: applications || [],
    };
  } catch (error) {
    console.error("Error in getJobApplicationsForJob:", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID công việc không hợp lệ" };
    }
    
    return { success: false, error: "Lỗi hệ thống" };
  }
} 