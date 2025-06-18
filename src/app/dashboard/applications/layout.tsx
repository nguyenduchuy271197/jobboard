import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ ứng tuyển | Job Board",
  description: "Quản lý và theo dõi các hồ sơ ứng tuyển của bạn",
};

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
