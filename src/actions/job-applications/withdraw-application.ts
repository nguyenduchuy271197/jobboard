"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const withdrawSchema = z.object({
  id: z.number().positive(),
}).strict();

export async function withdrawApplication(
  id: number
): Promise<{ 
  success: true; 
  message: string 
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

    const { id: applicationId } = withdrawSchema.parse({ id });

    // First, verify the application exists and belongs to the user
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, applicant_id, status")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: "Hồ sơ ứng tuyển không tồn tại" };
    }

    // Check if user owns this application
    if (application.applicant_id !== user.id) {
      return { success: false, error: "Bạn không có quyền rút lại hồ sơ ứng tuyển này" };
    }

    // Check if application can be withdrawn
    if (application.status === "accepted" || application.status === "rejected") {
      return { success: false, error: "Không thể rút lại hồ sơ ứng tuyển đã được chấp nhận hoặc từ chối" };
    }

    // Delete the application
    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId);

    if (deleteError) {
      console.error("Error withdrawing job application:", deleteError);
      return { success: false, error: "Không thể rút lại hồ sơ ứng tuyển" };
    }

    return {
      success: true,
      message: "Đã rút lại hồ sơ ứng tuyển thành công",
    };
  } catch (error) {
    console.error("Error in withdrawApplication:", error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID hồ sơ ứng tuyển không hợp lệ" };
    }
    
    return { success: false, error: "Lỗi hệ thống" };
  }
} 