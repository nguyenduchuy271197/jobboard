import { notFound } from "next/navigation";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";
import { JobApplicants } from "../../_components/job-applicants";

interface ApplicantsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicantsPage({ params }: ApplicantsPageProps) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    notFound();
  }

  // Check authentication
  const authCheck = await checkAuthWithProfile();
  if (!authCheck.success) {
    notFound();
  }

  const { user } = authCheck;

  // Verify user owns the job or has access
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      company:companies (
        id,
        name,
        owner_id
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ứng viên cho vị trí: {job.title}
        </h1>
        <p className="text-gray-600">
          Xem và quản lý các ứng viên đã ứng tuyển vào vị trí này
        </p>
      </div>

      <JobApplicants jobId={jobId} jobTitle={job.title} />
    </div>
  );
}
