import { redirect } from "next/navigation";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import { UsersContent } from "./_components/users-content";

export default async function AdminUsersPage() {
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
        title="Quản lý Người dùng"
        description="Quản lý tài khoản ứng viên và nhà tuyển dụng"
      />
      <UsersContent />
    </DashboardPageWrapper>
  );
}
