import { BriefcaseIcon } from "lucide-react";
import Link from "next/link";

export default function MainFooter() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BriefcaseIcon className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">JobBoard</span>
            </div>
            <p className="text-muted-foreground">
              Nền tảng tìm việc làm hàng đầu Việt Nam
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Dành cho ứng viên</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/jobs" className="hover:text-primary">
                  Tìm việc làm
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  Hồ sơ của tôi
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Dành cho nhà tuyển dụng</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  Đăng tin tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  Quản lý ứng viên
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 JobBoard. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
