import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý ứng viên | Dashboard",
  description:
    "Xem và quản lý hồ sơ ứng viên đã ứng tuyển vào các vị trí của công ty",
};

export default function CandidatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
