import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageWrapper } from "@/components/page-wrapper";
import { PageHeader } from "@/components/page-header";
import CompanyContent from "./_components/company-content";
import { Building } from "lucide-react";

export default async function CompanyPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Lấy profile để check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "employer") {
    redirect("/dashboard");
  }

  return (
    <PageWrapper maxWidth="4xl">
      <PageHeader
        title="Quản lý công ty"
        description="Quản lý thông tin công ty và hồ sơ doanh nghiệp của bạn"
      >
        <Building className="h-6 w-6 text-muted-foreground" />
      </PageHeader>

      <Suspense fallback={<div>Đang tải...</div>}>
        <CompanyContent userId={user.id} />
      </Suspense>
    </PageWrapper>
  );
}
