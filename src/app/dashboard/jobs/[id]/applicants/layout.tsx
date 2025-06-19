import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicantsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicantsLayout({
  children,
  params,
}: ApplicantsLayoutProps) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      {/* Breadcrumb and Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/jobs/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại chi tiết công việc
            </Link>
          </Button>
          <div className="text-sm text-gray-500">
            / <span className="text-gray-900">Ứng viên</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            Quản lý ứng viên
          </span>
        </div>
      </div>

      {/* Main Content */}
      {children}
    </div>
  );
}
