import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý công ty | Job Board",
  description: "Quản lý thông tin công ty và hồ sơ doanh nghiệp",
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
