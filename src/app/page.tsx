import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Briefcase className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Job Board</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Nền tảng tìm kiếm việc làm hàng đầu với hàng nghìn cơ hội từ các
            công ty uy tín.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild size="lg" className="w-48">
            <Link href="/jobs">Tìm việc làm ngay</Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            Khám phá cơ hội nghề nghiệp phù hợp với bạn
          </p>
        </div>
      </div>
    </div>
  );
}
