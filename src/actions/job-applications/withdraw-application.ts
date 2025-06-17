"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

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
    // 1. Validate input
    const { id: applicationId } = withdrawSchema.parse({ id });

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Verify application exists and belongs to user
    const supabase = await createClient();
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, applicant_id, status")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.NOT_FOUND };
    }

    // Check if user owns this application
    if (application.applicant_id !== user.id) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.UNAUTHORIZED_WITHDRAW };
    }

    // Check if application can be withdrawn
    if (application.status === "accepted" || application.status === "rejected") {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.CANNOT_WITHDRAW };
    }

    // 4. Delete the application
    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", applicationId);

    if (deleteError) {
      return { success: false, error: ERROR_MESSAGES.APPLICATION.WITHDRAW_FAILED };
    }

    return {
      success: true,
      message: "Đã rút lại hồ sơ ứng tuyển thành công",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "ID hồ sơ ứng tuyển không hợp lệ" };
    }
    
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 