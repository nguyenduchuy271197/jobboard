"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { DatabaseJobApplication } from "@/types/custom.types";

const paramsSchema = z.object({
  companyId: z.number().positive(),
}).strict();

export async function getCompanyApplications(
  companyId: number
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

    const { companyId: validCompanyId } = paramsSchema.parse({ companyId });

    // First, verify the user owns the company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, owner_id")
      .eq("id", validCompanyId)
      .single();

    if (companyError || !company) {
      return { success: false, error: "Công ty không tồn tại" };
    }

    if (company.owner_id !== user.id) {
      return { success: false, error: "Bạn không có quyền xem hồ sơ ứng tuyển của công ty này" };
    }

    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (
          id,
          title,
          employment_type,
          experience_level,
          company_id
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
      .eq("job.company_id", validCompanyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching company applications:", error);
      return { success: false, error: "Không thể tải danh sách hồ sơ ứng tuyển của công ty" };
    }

    return {
      success: true,
      data: applications || [],
    };
  } catch (error) {
    console.error("Error in getCompanyApplications:", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID công ty không hợp lệ" };
    }
    
    return { success: false, error: "Lỗi hệ thống" };
  }
} 