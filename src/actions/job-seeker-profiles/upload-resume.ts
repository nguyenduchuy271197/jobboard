"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const uploadResumeSchema = z.object({
  formData: z.instanceof(FormData),
});

type UploadResumeParams = z.infer<typeof uploadResumeSchema>;
type Result = 
  | { success: true; data: { cv_file_path: string } } 
  | { success: false; error: string };

export async function uploadResume(params: UploadResumeParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = uploadResumeSchema.parse(params);
    const file = data.formData.get('resume') as File;

    if (!file) {
      return { success: false, error: "Không có file được chọn" };
    }

    // 2. Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Chỉ chấp nhận file PDF, DOC, DOCX" };
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File không được vượt quá 5MB" };
    }

    // 3. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để upload resume" };
    }

    // 4. Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("job_seeker_profiles")
      .select("user_id, cv_file_path")
      .eq("user_id", user.id)
      .single();

    if (profileError || !existingProfile) {
      return { success: false, error: "Hồ sơ ứng viên không tồn tại" };
    }

    // 5. Delete old CV if exists
    if (existingProfile.cv_file_path) {
      const oldFileName = existingProfile.cv_file_path.split('/').pop();
      if (oldFileName) {
        await supabase.storage
          .from('cvs')
          .remove([`${user.id}/${oldFileName}`]);
      }
    }

    // 6. Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    // 7. Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // 8. Update profile with CV file path
    const { error: updateError } = await supabase
      .from("job_seeker_profiles")
      .update({ cv_file_path: uploadData.path })
      .eq("user_id", user.id);

    if (updateError) {
      // Cleanup uploaded file if database update fails
      await supabase.storage
        .from('cvs')
        .remove([uploadData.path]);
      
      return { success: false, error: updateError.message };
    }

    return { success: true, data: { cv_file_path: uploadData.path } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi upload resume" };
  }
} 