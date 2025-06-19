import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import CandidatesContent from "./_components/candidates-content";

export default function CandidatesPage() {
  return (
    <DashboardPageWrapper>
      <PageHeader
        title="Quản lý ứng viên"
        description="Xem và quản lý hồ sơ ứng viên đã ứng tuyển vào các vị trí của công ty"
      />
      <CandidatesContent />
    </DashboardPageWrapper>
  );
}
