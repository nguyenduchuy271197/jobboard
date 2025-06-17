"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { Job } from "@/types/custom.types";

const getJobSchema = z.object({
  id: z.number().int().positive("ID việc làm không hợp lệ"),
});

type GetJobParams = z.infer<typeof getJobSchema>;
type Result = 
  | { success: true; data: Job } 
  | { success: false; error: string };

export async function getJobDetails(params: GetJobParams): Promise<Result> {
  try {
    // 1. Validate input
    const data = getJobSchema.parse(params);

    // 2. Create Supabase client
    const supabase = await createClient();

    // 3. Execute query with relations
    const { data: job, error } = await supabase
      .from("jobs")
      .select(`
        *,
        company:companies(id, name, logo_url, is_verified, website_url, description),
        industry:industries(id, name, slug),
        location:locations(id, name, slug)
      `)
      .eq("id", data.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Việc làm không tồn tại" };
      }
      return { success: false, error: error.message };
    }

    if (!job) {
      return { success: false, error: "Việc làm không tồn tại" };
    }

    return { success: true, data: job };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra khi lấy thông tin việc làm" };
  }
} 