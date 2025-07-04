"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

const deleteFileSchema = z.object({
  bucket: z.enum(["cvs", "company-logos", "avatars"]),
  path: z.string().min(1, "Đường dẫn file không được để trống").trim(),
});

type DeleteFileResult = 
  | { success: true; data: { message: string } }
  | { success: false; error: string };

export async function deleteFile(
  params: z.infer<typeof deleteFileSchema>
): Promise<DeleteFileResult> {
  try {
    // 1. Validate input
    const validatedData = deleteFileSchema.parse(params);

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user, profile } = authCheck;

    // 3. Check permissions based on bucket type
    const pathParts = validatedData.path.split("/");
    const fileOwnerId = pathParts[0];

    if (validatedData.bucket === "cvs" || validatedData.bucket === "avatars") {
      // For CVs and avatars, only the owner can delete
      if (fileOwnerId !== user.id) {
        return { success: false, error: ERROR_MESSAGES.FILE.DELETE_FAILED };
      }
    } else if (validatedData.bucket === "company-logos") {
      // For company logos, check if user owns the company or is admin
      if (profile.role === "admin") {
        // Admin can delete any file
      } else {
        const companyId = parseInt(fileOwnerId, 10);
        if (isNaN(companyId)) {
          return { success: false, error: "ID công ty không hợp lệ" };
        }
        
        const supabase = await createClient();
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("owner_id")
          .eq("id", companyId)
          .single();

        if (companyError || !company) {
          return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
        }

        if (company.owner_id !== user.id) {
          return { success: false, error: ERROR_MESSAGES.FILE.DELETE_FAILED };
        }
      }
    }

    // 4. Delete file from storage
    const supabase = await createClient();
    const { error: deleteError } = await supabase.storage
      .from(validatedData.bucket)
      .remove([validatedData.path]);

    if (deleteError) {
      return { success: false, error: ERROR_MESSAGES.FILE.DELETE_FAILED };
    }

    return {
      success: true,
      data: { message: "Xóa file thành công" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 