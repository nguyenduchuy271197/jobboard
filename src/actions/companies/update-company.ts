"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Company } from "@/types/custom.types";

const updateCompanySchema = z.object({
  id: z.number().int().positive("ID công ty không hợp lệ"),
  name: z.string().min(1, "Tên công ty không được để trống").max(255, "Tên công ty không được quá 255 ký tự").optional(),
  description: z.string().optional(),
  website_url: z.string().url("URL website không hợp lệ").optional().or(z.literal("")),
  industry_id: z.number().int().positive("ID ngành nghề không hợp lệ").optional(),
  location_id: z.number().int().positive("ID địa điểm không hợp lệ").optional(),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
  address: z.string().optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  employee_count: z.number().int().min(0).optional(),
});

type UpdateCompanyParams = z.infer<typeof updateCompanySchema>;
type Result = 
  | { success: true; data: Company } 
  | { success: false; error: string };

export async function updateCompany(params: UpdateCompanyParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = updateCompanySchema.parse(params);

    // 2. Create Supabase client and get user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Bạn cần đăng nhập để cập nhật công ty" };
    }

    // 3. Check if company exists and user has permission
    const { data: existingCompany, error: companyError } = await supabase
      .from("companies")
      .select("id, owner_id")
      .eq("id", data.id)
      .single();

    if (companyError || !existingCompany) {
      return { success: false, error: "Công ty không tồn tại" };
    }

    if (existingCompany.owner_id !== user.id) {
      return { success: false, error: "Bạn không có quyền cập nhật công ty này" };
    }

    // 4. Check if industry exists (if provided)
    if (data.industry_id) {
      const { data: industry, error: industryError } = await supabase
        .from("industries")
        .select("id")
        .eq("id", data.industry_id)
        .single();

      if (industryError || !industry) {
        return { success: false, error: "Ngành nghề không tồn tại" };
      }
    }

    // 5. Check if location exists (if provided)
    if (data.location_id) {
      const { data: location, error: locationError } = await supabase
        .from("locations")
        .select("id")
        .eq("id", data.location_id)
        .single();

      if (locationError || !location) {
        return { success: false, error: "Địa điểm không tồn tại" };
      }
    }

    // 6. Prepare update data (only include provided fields)
    const updateData: Partial<{
      name: string;
      description: string | null;
      website_url: string | null;
      industry_id: number | null;
      location_id: number | null;
      size: "startup" | "small" | "medium" | "large" | "enterprise" | null;
      address: string | null;
      founded_year: number | null;
      employee_count: number | null;
    }> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.website_url !== undefined) updateData.website_url = data.website_url || null;
    if (data.industry_id !== undefined) updateData.industry_id = data.industry_id;
    if (data.location_id !== undefined) updateData.location_id = data.location_id;
    if (data.size !== undefined) updateData.size = data.size;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.founded_year !== undefined) updateData.founded_year = data.founded_year;
    if (data.employee_count !== undefined) updateData.employee_count = data.employee_count;

    // 7. Update company
    const { data: company, error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", data.id)
      .select(`
        *,
        industry:industries(id, name, slug),
        location:locations(id, name, slug),
        owner:profiles(id, full_name, email)
      `)
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Tên công ty đã tồn tại" };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: company };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi cập nhật công ty" };
  }
} 