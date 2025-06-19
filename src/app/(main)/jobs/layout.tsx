import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm việc làm | Job Board",
  description:
    "Khám phá hàng ngàn cơ hội việc làm hấp dẫn từ các công ty hàng đầu. Tìm kiếm theo ngành nghề, địa điểm và mức lương phù hợp với bạn.",
  keywords: ["việc làm", "tuyển dụng", "tìm việc", "công việc", "career"],
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
