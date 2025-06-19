import { redirect } from "next/navigation";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import { IndustriesContent } from "./_components/industries-content";

export default async function IndustriesPage() {
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
        title="Quản lý Ngành nghề"
        description="Quản lý danh sách ngành nghề và lĩnh vực công việc"
      />
      <IndustriesContent />
    </DashboardPageWrapper>
  );
}
