"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { FileMetadata } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { checkAuthWithProfile } from "@/lib/auth-utils";

const getFileSchema = z.object({
  bucket: z.enum(["cvs", "company-logos", "avatars"]),
  path: z.string().min(1, "Đường dẫn file không được để trống").trim(),
});

type GetFileResult = 
  | { success: true; data: FileMetadata }
  | { success: false; error: string };

export async function getFile(
  params: z.infer<typeof getFileSchema>
): Promise<GetFileResult> {
  try {
    // 1. Validate input
    const validatedData = getFileSchema.parse(params);

    // 2. Check authentication
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const { user, profile } = authCheck;

    // 3. Check permissions based on bucket type
    const supabase = await createClient();
    
    if (validatedData.bucket === "cvs") {
      const pathParts = validatedData.path.split("/");
      const fileOwnerId = pathParts[0];

      // Allow access if it's the owner or an employer/admin
      const hasAccess = 
        fileOwnerId === user.id || 
        profile.role === "employer" || 
        profile.role === "admin";

      if (!hasAccess) {
        return { success: false, error: ERROR_MESSAGES.AUTH.UNAUTHORIZED };
      }
    } else if (validatedData.bucket === "company-logos") {
      // For company logos, check if user owns the company or is admin
      if (profile.role !== "admin") {
        const pathParts = validatedData.path.split("/");
        const companyIdStr = pathParts[0];
        const companyId = parseInt(companyIdStr, 10);
        
        if (isNaN(companyId)) {
          return { success: false, error: "ID công ty không hợp lệ" };
        }
        
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("owner_id")
          .eq("id", companyId)
          .single();

        if (companyError) {
          // If company not found, still allow access to logos (public)
        } else if (company.owner_id !== user.id) {
          return { success: false, error: ERROR_MESSAGES.AUTH.UNAUTHORIZED };
        }
      }
    } else if (validatedData.bucket === "avatars") {
      // For avatars, check if it's the user's own avatar or admin
      if (profile.role !== "admin") {
        const pathParts = validatedData.path.split("/");
        const fileOwnerId = pathParts[0];

        if (fileOwnerId !== user.id) {
          return { success: false, error: ERROR_MESSAGES.AUTH.UNAUTHORIZED };
        }
      }
    }

    // 4. Get file info from storage
    const folderPath = validatedData.path.split("/").slice(0, -1).join("/");
    const fileName = validatedData.path.split("/").pop();

    const { data: fileList, error: listError } = await supabase.storage
      .from(validatedData.bucket)
      .list(folderPath || "", {
        search: fileName,
      });

    if (listError) {
      return { success: false, error: ERROR_MESSAGES.FILE.NOT_FOUND };
    }

    const fileInfo = fileList?.find(file => file.name === fileName);

    if (!fileInfo) {
      return { success: false, error: ERROR_MESSAGES.FILE.NOT_FOUND };
    }

    // 5. Convert file info to our metadata format
    const metadata: FileMetadata = {
      name: fileInfo.name,
      id: fileInfo.id || "",
      updated_at: fileInfo.updated_at || "",
      created_at: fileInfo.created_at || "",
      last_accessed_at: fileInfo.last_accessed_at || "",
      size: fileInfo.metadata?.size || 0,
      mimetype: fileInfo.metadata?.mimetype || "",
      etag: fileInfo.metadata?.eTag || "",
      path: validatedData.path,
      bucket: validatedData.bucket,
    };

    return {
      success: true,
      data: metadata,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 