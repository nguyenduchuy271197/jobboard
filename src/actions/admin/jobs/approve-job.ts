"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  job_id: z.number(),
});

type Result = { success: true } | { success: false; error: string };

export async function approveJob(params: { job_id: number }): Promise<Result> {
  try {
    const data = schema.parse(params);

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để thực hiện thao tác này" };
    }

    // Kiểm tra quyền admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Bạn không có quyền thực hiện thao tác này" };
    }

    // Kiểm tra job tồn tại
    const { data: job } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", data.job_id)
      .single();

    if (!job) {
      return { success: false, error: "Công việc không tồn tại" };
    }

    if (job.status === "published") {
      return { success: false, error: "Công việc đã được phê duyệt" };
    }

    // Cập nhật trạng thái thành published
    const { error: updateError } = await supabase
      .from("jobs")
      .update({ 
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.job_id);

    if (updateError) {
      return { success: false, error: "Không thể phê duyệt công việc" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Lỗi hệ thống" };
  }
} 