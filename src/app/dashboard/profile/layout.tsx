import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hồ sơ ứng viên",
  description: "Quản lý hồ sơ ứng viên và CV của bạn",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
