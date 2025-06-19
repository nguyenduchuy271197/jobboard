"use client";

import {
  Profile,
  GeneralDashboardStats,
  JobSeekerDashboardStats,
  EmployerDashboardStats,
  AdminDashboardStats,
} from "@/types/custom.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  FileText,
  Building,
  TrendingUp,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";

type DashboardStats =
  | GeneralDashboardStats
  | JobSeekerDashboardStats
  | EmployerDashboardStats
  | AdminDashboardStats;

interface DashboardContentProps {
  profile: Profile;
  stats: DashboardStats | null;
}

export default function DashboardContent({
  profile,
  stats,
}: DashboardContentProps) {
  const getJobSeekerContent = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đơn ứng tuyển</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as JobSeekerDashboardStats)?.applications
              ?.total_applications || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            +
            {(stats as JobSeekerDashboardStats)?.applications
              ?.applications_this_month || 0}{" "}
            trong tuần qua
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Việc làm mới</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as JobSeekerDashboardStats)?.jobs?.recommended_jobs || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Việc làm phù hợp với bạn
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tỷ lệ thành công
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as JobSeekerDashboardStats)?.applications
              ?.application_success_rate || 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            Tỷ lệ được mời phỏng vấn
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
          <CardDescription>Các tác vụ thường dùng</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/jobs">
              <Search className="h-4 w-4 mr-2" />
              Tìm việc làm
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/profile">Cập nhật hồ sơ</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/applications">Xem đơn ứng tuyển</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const getEmployerContent = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tin tuyển dụng</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as EmployerDashboardStats)?.company?.active_jobs || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            +
            {(stats as EmployerDashboardStats)?.hiring
              ?.jobs_posted_this_month || 0}{" "}
            trong tuần qua
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ứng viên</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as EmployerDashboardStats)?.applications
              ?.pending_applications || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Tổng số ứng viên ứng tuyển
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Đơn ứng tuyển mới
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as EmployerDashboardStats)?.hiring
              ?.applications_this_month || 0}
          </div>
          <p className="text-xs text-muted-foreground">Cần xem xét</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
          <CardDescription>Các tác vụ thường dùng</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/jobs">
              <Plus className="h-4 w-4 mr-2" />
              Đăng tin tuyển dụng
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/company">
              <Building className="h-4 w-4 mr-2" />
              Quản lý công ty
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/candidates">Xem ứng viên</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const getAdminContent = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as AdminDashboardStats)?.overview?.total_users || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            +
            {(stats as AdminDashboardStats)?.user_management
              ?.new_users_this_week || 0}{" "}
            mới trong tuần
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Việc làm</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as AdminDashboardStats)?.overview?.total_jobs || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {(stats as AdminDashboardStats)?.content_moderation
              ?.pending_job_approvals || 0}{" "}
            chờ duyệt
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Công ty</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as AdminDashboardStats)?.overview?.total_companies || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {(stats as AdminDashboardStats)?.content_moderation
              ?.pending_company_verifications || 0}{" "}
            chờ xác minh
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đơn ứng tuyển</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats as AdminDashboardStats)?.overview?.total_applications || 0}
          </div>
          <p className="text-xs text-muted-foreground">Tổng số đơn ứng tuyển</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Quản lý hệ thống</CardTitle>
          <CardDescription>Các tác vụ quản trị</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/admin/users">
              <Users className="h-4 w-4 mr-2" />
              Quản lý người dùng
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/jobs">Duyệt việc làm</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/reports">Xem báo cáo</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div>
      {profile.role === "job_seeker" && getJobSeekerContent()}
      {profile.role === "employer" && getEmployerContent()}
      {profile.role === "admin" && getAdminContent()}
    </div>
  );
}
