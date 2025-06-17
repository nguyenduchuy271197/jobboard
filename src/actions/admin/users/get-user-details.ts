"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { AdminUserDetails } from "@/types/custom.types";

const schema = z.object({
  user_id: z.string().uuid(),
});

type Result = { 
  success: true; 
  data: AdminUserDetails;
} | { 
  success: false; 
  error: string 
};

export async function getUserDetails(params: { user_id: string }): Promise<Result> {
  try {
    const data = schema.parse(params);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    // Kiểm tra quyền admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Bạn không có quyền truy cập chức năng này" };
    }

    // Lấy thông tin user với tất cả relations
    const { data: userDetails, error } = await supabase
      .from("profiles")
      .select(`
        *,
        job_seeker_profile:job_seeker_profiles(
          *,
          preferred_location:locations(*)
        ),
        companies(*),
        jobs_count:jobs(count),
        applications_count:applications(count)
      `)
      .eq("id", data.user_id)
      .single();

    if (error) {
      return { success: false, error: "Không tìm thấy thông tin người dùng" };
    }

    if (!userDetails) {
      return { success: false, error: "Người dùng không tồn tại" };
    }

    // Format dữ liệu trả về
    const result: AdminUserDetails = {
      ...userDetails,
      jobs_count: Array.isArray(userDetails.jobs_count) ? userDetails.jobs_count.length : 0,
      applications_count: Array.isArray(userDetails.applications_count) ? userDetails.applications_count.length : 0,
      last_login: userDetails.last_sign_in_at || undefined,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Lỗi hệ thống" };
  }
} 