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
            <Link href="/auth/login">
              <Button size="sm">Đăng nhập</Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
