"use client";

import { useState, useMemo } from "react";
import { useUserApplications } from "@/hooks/job-applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationCard } from "./application-card";
import { ApplicationDetailDialog } from "./application-detail-dialog";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, Filter, Briefcase } from "lucide-react";

import type { DatabaseJobApplication } from "@/types/custom.types";

type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interviewing"
  | "accepted"
  | "rejected"
  | "withdrawn";

export function ApplicationsContent() {
  const [selectedApplication, setSelectedApplication] =
    useState<DatabaseJobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );

  const { data: applications, isLoading, error } = useUserApplications();

  // Filter applications based on status
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    if (statusFilter === "all") return applications;
    return applications.filter((app) => app.status === statusFilter);
  }, [applications, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!applications)
      return { total: 0, pending: 0, accepted: 0, rejected: 0 };

    return {
      total: applications.length,
      pending: applications.filter(
        (app) => app.status === "pending" || app.status === "reviewing"
      ).length,
      accepted: applications.filter((app) => app.status === "accepted").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };
  }, [applications]);

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Có lỗi xảy ra khi tải hồ sơ ứng tuyển: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Chưa có hồ sơ ứng tuyển nào
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Bắt đầu ứng tuyển các công việc phù hợp với bạn.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/jobs">Tìm việc làm</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hồ sơ</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số hồ sơ đã ứng tuyển
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang chờ</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Đang chờ phản hồi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Được chấp nhận
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
            <p className="text-xs text-muted-foreground">
              Ứng tuyển thành công
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bị từ chối</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Không phù hợp</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Lọc theo trạng thái:</span>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as ApplicationStatus | "all")
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Chọn trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Chờ xử lý</SelectItem>
            <SelectItem value="reviewing">Đang xem xét</SelectItem>
            <SelectItem value="interviewing">Phỏng vấn</SelectItem>
            <SelectItem value="accepted">Được chấp nhận</SelectItem>
            <SelectItem value="rejected">Bị từ chối</SelectItem>
            <SelectItem value="withdrawn">Đã rút lại</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có hồ sơ ứng tuyển nào với trạng thái này
          </div>
        ) : (
          filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onClick={() => setSelectedApplication(application)}
            />
          ))
        )}
      </div>

      {/* Application Detail Dialog */}
      {selectedApplication && (
        <ApplicationDetailDialog
          application={selectedApplication}
          open={!!selectedApplication}
          onOpenChange={(open) => !open && setSelectedApplication(null)}
        />
      )}
    </div>
  );
}
