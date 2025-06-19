import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import { JobsPostedContent } from "./_components/jobs-posted-content";

export default function JobsPostedPage() {
  return (
    <DashboardPageWrapper>
      <PageHeader
        title="Tin tuyển dụng đã đăng"
        description="Quản lý các tin tuyển dụng của công ty bạn"
      />
      <JobsPostedContent />
    </DashboardPageWrapper>
  );
}
