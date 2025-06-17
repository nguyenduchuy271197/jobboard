"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const uploadFileSchema = z.object({
  bucket: z.enum(["cvs", "company-logos", "avatars"]),
  folder: z.string().optional(),
  filename: z.string().optional(),
});

type UploadFileResult = 
  | { success: true; data: { path: string; url: string } }
  | { success: false; error: string };

export async function uploadFile(
  formData: FormData
): Promise<UploadFileResult> {
  try {
    // Validate form data
    const bucket = formData.get("bucket") as string;
    const folder = formData.get("folder") as string | null;
    const filename = formData.get("filename") as string | null;
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "File không được để trống" };
    }

    const validatedData = uploadFileSchema.parse({
      bucket,
      folder: folder || undefined,
      filename: filename || undefined,
    });

    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để upload file" };
    }

    // Check file size limits based on bucket
    const fileSizeLimits = {
      cvs: 50 * 1024 * 1024, // 50MB
      "company-logos": 10 * 1024 * 1024, // 10MB
      avatars: 5 * 1024 * 1024, // 5MB
    };

    if (file.size > fileSizeLimits[validatedData.bucket]) {
      return { 
        success: false, 
        error: `File quá lớn. Kích thước tối đa cho ${validatedData.bucket} là ${fileSizeLimits[validatedData.bucket] / (1024 * 1024)}MB` 
      };
    }

    // Check file type based on bucket
    const allowedMimeTypes = {
      cvs: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      "company-logos": ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      avatars: ["image/jpeg", "image/png", "image/webp"],
    };

    if (!allowedMimeTypes[validatedData.bucket].includes(file.type)) {
      return { 
        success: false, 
        error: `Loại file không được hỗ trợ cho ${validatedData.bucket}. Chỉ chấp nhận: ${allowedMimeTypes[validatedData.bucket].join(", ")}` 
      };
    }

    // Generate file path
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const baseFilename = validatedData.filename || `${timestamp}`;
    const finalFilename = `${baseFilename}.${fileExtension}`;
    
    let filePath: string;
    if (validatedData.bucket === "cvs" || validatedData.bucket === "avatars") {
      // For CVs and avatars, organize by user ID
      filePath = `${user.id}/${finalFilename}`;
    } else if (validatedData.bucket === "company-logos") {
      // For company logos, organize by company ID (folder should be company ID)
      const companyId = validatedData.folder || user.id;
      filePath = `${companyId}/${finalFilename}`;
    } else {
      filePath = validatedData.folder ? `${validatedData.folder}/${finalFilename}` : finalFilename;
    }

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(validatedData.bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: `Lỗi upload file: ${uploadError.message}` };
    }

    // Get public URL for public buckets
    let publicUrl = "";
    if (validatedData.bucket === "company-logos" || validatedData.bucket === "avatars") {
      const { data: urlData } = supabase.storage
        .from(validatedData.bucket)
        .getPublicUrl(uploadData.path);
      publicUrl = urlData.publicUrl;
    } else {
      // For private buckets like CVs, create signed URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from(validatedData.bucket)
        .createSignedUrl(uploadData.path, 3600); // 1 hour expiry

      if (urlError) {
        return { success: false, error: `Lỗi tạo URL file: ${urlError.message}` };
      }
      publicUrl = urlData.signedUrl;
    }

    return {
      success: true,
      data: {
        path: uploadData.path,
        url: publicUrl,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi upload file" };
  }
} 