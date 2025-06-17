"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

const uploadFileSchema = z.object({
  bucket: z.enum(["cvs", "company-logos", "avatars"]),
  folder: z.string().trim().optional(),
  filename: z.string().trim().optional(),
});

type UploadFileResult = 
  | { success: true; data: { path: string; url: string } }
  | { success: false; error: string };

export async function uploadFile(
  formData: FormData
): Promise<UploadFileResult> {
  try {
    // 1. Validate form data
    const bucket = formData.get("bucket") as string;
    const folder = formData.get("folder") as string | null;
    const filename = formData.get("filename") as string | null;
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: ERROR_MESSAGES.FILE.NOT_FOUND };
    }

    const validatedData = uploadFileSchema.parse({
      bucket,
      folder: folder || undefined,
      filename: filename || undefined,
    });

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user } = authCheck;

    // 3. Check file size limits based on bucket
    const fileSizeLimits = {
      cvs: 50 * 1024 * 1024, // 50MB
      "company-logos": 10 * 1024 * 1024, // 10MB
      avatars: 5 * 1024 * 1024, // 5MB
    };

    if (file.size > fileSizeLimits[validatedData.bucket]) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.FILE.TOO_LARGE
      };
    }

    // 4. Check file type based on bucket
    const allowedMimeTypes = {
      cvs: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      "company-logos": ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
      avatars: ["image/jpeg", "image/png", "image/webp"],
    };

    if (!allowedMimeTypes[validatedData.bucket].includes(file.type)) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.FILE.INVALID_TYPE
      };
    }

    // 5. Generate file path
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

    // 6. Upload file to storage
    const supabase = await createClient();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(validatedData.bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: ERROR_MESSAGES.FILE.UPLOAD_FAILED };
    }

    // 7. Get URL based on bucket type
    let publicUrl = "";
    if (validatedData.bucket === "company-logos" || validatedData.bucket === "avatars") {
      // Public buckets - get public URL
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
        return { success: false, error: ERROR_MESSAGES.FILE.UPLOAD_FAILED };
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
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 