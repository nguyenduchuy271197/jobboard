"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const uploadLogoSchema = z.object({
  company_id: z.number().int().positive("ID công ty không hợp lệ"),
  logo: z.instanceof(FormData, { message: "Logo file là bắt buộc" }),
});

type UploadLogoParams = z.infer<typeof uploadLogoSchema>;
type Result = 
  | { success: true; data: Company } 
  | { success: false; error: string };

export async function uploadCompanyLogo(params: UploadLogoParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = uploadLogoSchema.parse(params);

    // 2. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để upload logo" };
    }

    // 3. Check if company exists and user has permission
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, owner_id, logo_url")
      .eq("id", data.company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: "Công ty không tồn tại" };
    }

    if (existingCompany.owner_id !== user.id) {
      return { success: false, error: "Bạn không có quyền upload logo cho công ty này" };
    }

    // 4. Extract file from FormData
    const file = data.logo.get("logo") as File;
    
    if (!file) {
      return { success: false, error: "Không tìm thấy file logo" };
    }

    // 5. Validate file type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: "Chỉ chấp nhận file ảnh định dạng JPEG, PNG hoặc WebP" 
      };
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { success: false, error: "Kích thước file không được vượt quá 2MB" };
    }

    // 6. Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const fileName = `${data.company_id}-${Date.now()}.${fileExt}`;

    // 7. Delete old logo if exists
    if (existingCompany.logo_url) {
      const oldLogoPath = existingCompany.logo_url.split('/').pop();
      if (oldLogoPath) {
        await supabase.storage
          .from('company-logos')
          .remove([oldLogoPath]);
      }
    }

    // 8. Upload new logo to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { success: false, error: `Lỗi upload file: ${uploadError.message}` };
    }

    // 9. Get public URL
    const { data: urlData } = supabase.storage
      .from('company-logos')
      .getPublicUrl(fileName);

    // 10. Update company with new logo URL
    const { data: company, error: updateError } = await supabase
      .from("companies")
      .update({ logo_url: urlData.publicUrl })
      .eq("id", data.company_id)
      .select(`
        *,
        industry:industries(id, name, slug),
        location:locations(id, name, slug),
        owner:profiles(id, full_name, email)
      `)
      .single();

    if (updateError) {
      // Clean up uploaded file if database update fails
      await supabase.storage
        .from('company-logos')
        .remove([fileName]);
      
      return { success: false, error: updateError.message };
    }

    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi upload logo" };
  }
} 