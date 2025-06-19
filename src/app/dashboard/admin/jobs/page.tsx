import { redirect } from "next/navigation";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import { JobsContent } from "./_components/jobs-content";

export default async function AdminJobsPage() {
  const authCheck = await checkAuthWithProfile();

  if (!authCheck.success) {
    redirect("/auth/login");
  }

  const { profile } = authCheck;

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <DashboardPageWrapper>
      <PageHeader
        title="Quản lý Tin tuyển dụng"
        description="Duyệt và quản lý các tin tuyển dụng"
      />
      <JobsContent />
    </DashboardPageWrapper>
  );
}
