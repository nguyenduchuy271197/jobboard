"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const deleteFileSchema = z.object({
  bucket: z.enum(["cvs", "company-logos", "avatars"]),
  path: z.string().min(1, "Đường dẫn file không được để trống"),
});

type DeleteFileResult = 
  | { success: true; data: { message: string } }
  | { success: false; error: string };

export async function deleteFile(
  params: z.infer<typeof deleteFileSchema>
): Promise<DeleteFileResult> {
  try {
    // Validate input
    const validatedData = deleteFileSchema.parse(params);

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để xóa file" };
    }

    // Check if user has permission to delete this file
    const pathParts = validatedData.path.split("/");
    const fileOwnerId = pathParts[0];

    if (validatedData.bucket === "cvs" || validatedData.bucket === "avatars") {
      // For CVs and avatars, only the owner can delete
      if (fileOwnerId !== user.id) {
        return { success: false, error: "Bạn không có quyền xóa file này" };
      }
    } else if (validatedData.bucket === "company-logos") {
      // For company logos, check if user owns the company
      const companyId = parseInt(fileOwnerId, 10);
      if (isNaN(companyId)) {
        return { success: false, error: "ID công ty không hợp lệ" };
      }
      
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("owner_id")
        .eq("id", companyId)
        .single();

      if (companyError || !company) {
        return { success: false, error: "Không tìm thấy công ty" };
      }

      if (company.owner_id !== user.id) {
        return { success: false, error: "Bạn không có quyền xóa logo của công ty này" };
      }
    }

    // Delete file from storage
    const { error: deleteError } = await supabase.storage
      .from(validatedData.bucket)
      .remove([validatedData.path]);

    if (deleteError) {
      return { success: false, error: `Lỗi xóa file: ${deleteError.message}` };
    }

    return {
      success: true,
      data: { message: "Xóa file thành công" },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi xóa file" };
  }
} 