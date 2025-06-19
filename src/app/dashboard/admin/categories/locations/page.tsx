import { redirect } from "next/navigation";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import { LocationsContent } from "./_components/locations-content";

export default async function LocationsPage() {
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
        title="Quản lý Địa điểm"
        description="Quản lý danh sách tỉnh thành và khu vực"
      />
      <LocationsContent />
    </DashboardPageWrapper>
  );
}
