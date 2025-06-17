"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAuthWithProfile, checkCompanyAccess } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const uploadLogoSchema = z.object({
  company_id: z.number().int().positive(ERROR_MESSAGES.VALIDATION.INVALID_ID),
  logo: z.instanceof(FormData, { message: ERROR_MESSAGES.FILE.NOT_FOUND }),
});

type UploadLogoParams = z.infer<typeof uploadLogoSchema>;
type Result = 
  | { success: true; data: Company } 
  | { success: false; error: string };

export async function uploadCompanyLogo(params: UploadLogoParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = uploadLogoSchema.parse(params);

    // 2. Check authentication and company access
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const accessCheck = await checkCompanyAccess(data.company_id);
    if (!accessCheck.success) {
      return { success: false, error: accessCheck.error };
    }

    const supabase = await createClient();

    // 3. Get company details for logo cleanup
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, logo_url")
      .eq("id", data.company_id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: ERROR_MESSAGES.COMPANY.NOT_FOUND };
    }

    // 4. Extract file from FormData
    const file = data.logo.get("logo") as File;
    
    if (!file) {
      return { success: false, error: ERROR_MESSAGES.FILE.NOT_FOUND };
    }

    // 5. Validate file type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: ERROR_MESSAGES.FILE.INVALID_TYPE };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: ERROR_MESSAGES.FILE.TOO_LARGE };
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
      return { success: false, error: ERROR_MESSAGES.FILE.UPLOAD_FAILED };
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
      
      return { success: false, error: ERROR_MESSAGES.COMPANY.UPDATE_FAILED };
    }

    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 