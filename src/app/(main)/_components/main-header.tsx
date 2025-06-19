import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MainHeader() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/jobs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Việc làm
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Đăng nhập
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Đăng ký</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
