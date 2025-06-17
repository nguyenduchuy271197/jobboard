"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const getFileUrlSchema = z.object({
  bucket: z.enum(["cvs", "company-logos", "avatars"]),
  path: z.string().min(1, "Đường dẫn file không được để trống"),
  expiresIn: z.number().default(3600), // 1 hour default for signed URLs
});

type GetFileUrlResult = 
  | { success: true; data: { url: string; isPublic: boolean } }
  | { success: false; error: string };

export async function getFileUrl(
  params: z.infer<typeof getFileUrlSchema>
): Promise<GetFileUrlResult> {
  try {
    // Validate input
    const validatedData = getFileUrlSchema.parse(params);

    // Auth check for private buckets
    const supabase = await createClient();
    
    if (validatedData.bucket === "cvs") {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return { success: false, error: "Bạn cần đăng nhập để truy cập file CV" };
      }

      // Check if user has permission to access this CV
      const pathParts = validatedData.path.split("/");
      const fileOwnerId = pathParts[0];

      // Allow access if it's the owner or an employer/admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const hasAccess = 
        fileOwnerId === user.id || 
        profile?.role === "employer" || 
        profile?.role === "admin";

      if (!hasAccess) {
        return { success: false, error: "Bạn không có quyền truy cập file này" };
      }
    }

    // Check if file exists
    const { data: fileList, error: listError } = await supabase.storage
      .from(validatedData.bucket)
      .list(validatedData.path.split("/").slice(0, -1).join("/") || "", {
        search: validatedData.path.split("/").pop(),
      });

    if (listError) {
      return { success: false, error: `Lỗi kiểm tra file: ${listError.message}` };
    }

    const fileName = validatedData.path.split("/").pop();
    const fileExists = fileList?.some(file => file.name === fileName);

    if (!fileExists) {
      return { success: false, error: "File không tồn tại" };
    }

    // Get URL based on bucket type
    if (validatedData.bucket === "company-logos" || validatedData.bucket === "avatars") {
      // Public buckets - get public URL
      const { data: urlData } = supabase.storage
        .from(validatedData.bucket)
        .getPublicUrl(validatedData.path);

      return {
        success: true,
        data: {
          url: urlData.publicUrl,
          isPublic: true,
        },
      };
    } else {
      // Private buckets - create signed URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from(validatedData.bucket)
        .createSignedUrl(validatedData.path, validatedData.expiresIn);

      if (urlError) {
        return { success: false, error: `Lỗi tạo URL file: ${urlError.message}` };
      }

      return {
        success: true,
        data: {
          url: urlData.signedUrl,
          isPublic: false,
        },
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy URL file" };
  }
} 