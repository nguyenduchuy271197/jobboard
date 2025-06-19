"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Mail,
  Phone,
  MapPin,
  Download,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { DatabaseJobApplication } from "@/types/custom.types";
import { getApplicationStatusConfig } from "@/constants/labels";
import { useJobApplicationsForJob } from "@/hooks/job-applications";
import { ApplicantDetailDialog } from "./applicant-detail-dialog";

interface JobApplicantsProps {
  jobId: number;
  jobTitle?: string;
}

type ApplicationStatus =
  | "pending"
  | "reviewing"
  | "interviewing"
  | "accepted"
  | "rejected"
  | "withdrawn";

export function JobApplicants({ jobId, jobTitle }: JobApplicantsProps) {
  const [selectedApplication, setSelectedApplication] =
    useState<DatabaseJobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );

  const {
    data: applications,
    isLoading,
    error,
  } = useJobApplicationsForJob(jobId);

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
    return (
      <div className="text-center py-8">Đang tải danh sách ứng viên...</div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Có lỗi xảy ra khi tải danh sách ứng viên: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Chưa có ứng viên nào
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {jobTitle
            ? `Chưa có ai ứng tuyển vào vị trí "${jobTitle}"`
            : "Chưa có ứng viên nào ứng tuyển vào công việc này."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ứng viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số hồ sơ ứng tuyển
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
            <p className="text-xs text-muted-foreground">Chờ xem xét</p>
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
            <p className="text-xs text-muted-foreground">Ứng viên phù hợp</p>
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

      {/* Applicants List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không có ứng viên nào với trạng thái này
          </div>
        ) : (
          filteredApplications.map((application) => {
            const statusInfo = getApplicationStatusConfig(application.status);
            const profile = application.applicant;
            const jobSeekerProfile = profile?.job_seeker_profile;

            return (
              <Card
                key={application.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedApplication(application)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={profile?.avatar_url || undefined}
                            alt={profile?.full_name || "Applicant"}
                          />
                          <AvatarFallback>
                            {profile?.full_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {profile?.full_name || "Chưa cập nhật tên"}
                            </h3>
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">
                            {jobSeekerProfile?.headline || "Chưa có chức danh"}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {profile?.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">
                                  {profile.email}
                                </span>
                              </div>
                            )}

                            {profile?.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span>{profile.phone}</span>
                              </div>
                            )}

                            {jobSeekerProfile?.preferred_location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {jobSeekerProfile.preferred_location.name}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                Ứng tuyển{" "}
                                {formatDistanceToNow(
                                  new Date(application.applied_at),
                                  {
                                    addSuffix: true,
                                    locale: vi,
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Experience and skills preview */}
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                            {jobSeekerProfile?.skills &&
                              jobSeekerProfile.skills.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span>
                                    {jobSeekerProfile.skills
                                      .slice(0, 3)
                                      .join(", ")}
                                  </span>
                                  {jobSeekerProfile.skills.length > 3 && (
                                    <span className="text-gray-400">
                                      +{jobSeekerProfile.skills.length - 3} kỹ
                                      năng khác
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>

                          {/* Cover letter preview */}
                          {application.cover_letter && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                              <div className="flex items-center gap-1 mb-1">
                                <FileText className="h-3 w-3 text-gray-500" />
                                <span className="text-xs font-medium text-gray-600">
                                  Thư xin việc:
                                </span>
                              </div>
                              <p className="text-gray-700 line-clamp-2">
                                {application.cover_letter}
                              </p>
                            </div>
                          )}

                          {/* Notes if any */}
                          {application.notes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <div className="flex items-center gap-1 mb-1">
                                <FileText className="h-3 w-3 text-blue-500" />
                                <span className="text-xs font-medium text-blue-700">
                                  Ghi chú:
                                </span>
                              </div>
                              <p className="text-blue-800 line-clamp-2">
                                {application.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(application);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Chi tiết
                      </Button>

                      {jobSeekerProfile?.cv_file_path && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={`/api/files/${jobSeekerProfile.cv_file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Tải CV
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Applicant Detail Dialog */}
      {selectedApplication && (
        <ApplicantDetailDialog
          application={selectedApplication}
          open={!!selectedApplication}
          onOpenChange={(open) => {
            if (!open) setSelectedApplication(null);
          }}
        />
      )}
    </div>
  );
}
