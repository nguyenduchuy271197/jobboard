import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import { JobsContent } from "./_components/jobs-content";

export default function JobsPage() {
  return (
    <DashboardPageWrapper>
      <PageHeader
        title="Tin tuyển dụng đã đăng"
        description="Quản lý các tin tuyển dụng của công ty bạn"
      />
      <JobsContent />
    </DashboardPageWrapper>
  );
}
