import { notFound, redirect } from "next/navigation";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import { JobEditForm } from "./_components/job-edit-form";

interface JobEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobEditPage({ params }: JobEditPageProps) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    notFound();
  }

  // Check authentication
  const authCheck = await checkAuthWithProfile();
  if (!authCheck.success) {
    redirect("/auth/login");
  }

  const { user } = authCheck;

  // Fetch job details
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies (
        id,
        name,
        logo_url,
        description,
        website_url,
        owner_id
      ),
      location:locations (
        id,
        name
      ),
      industry:industries (
        id,
        name
      )
    `
    )
    .eq("id", jobId)
    .single();

  if (error || !job) {
    notFound();
  }

  // Check if user owns the company that posted the job
  if (job.company?.owner_id !== user.id) {
    notFound();
  }

  // Get user companies for the form
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .eq("is_active", true);

  if (!companies || companies.length === 0) {
    redirect("/dashboard/company");
  }

  return (
    <DashboardPageWrapper>
      <PageHeader
        title={`Chỉnh sửa: ${job.title}`}
        description="Cập nhật thông tin tin tuyển dụng"
      />
      <JobEditForm job={job} companies={companies} />
    </DashboardPageWrapper>
  );
}
