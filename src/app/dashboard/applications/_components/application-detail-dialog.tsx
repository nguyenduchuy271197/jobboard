"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  Briefcase,
  Building2,
  ExternalLink,
  Calendar,
  DollarSign,
  User,
  FileText,
  Globe,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import type { DatabaseJobApplication } from "@/types/custom.types";
import {
  getApplicationStatusConfig,
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
} from "@/constants/labels";

interface ApplicationDetailDialogProps {
  application: DatabaseJobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationDetailDialog({
  application,
  open,
  onOpenChange,
}: ApplicationDetailDialogProps) {
  const statusInfo = getApplicationStatusConfig(application.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết hồ sơ ứng tuyển
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về hồ sơ ứng tuyển của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin công việc</h3>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={application.job?.company?.logo_url || undefined}
                  alt={application.job?.company?.name || "Company"}
                />
                <AvatarFallback>
                  <Building2 className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {application.job?.title}
                    </h4>
                    <p className="text-gray-600">
                      {application.job?.company?.name}
                      {application.job?.company?.is_verified && (
                        <span className="ml-1 text-blue-600">
                          ✓ Đã xác thực
                        </span>
                      )}
                    </p>
                  </div>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/jobs/${application.job?.id}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Xem chi tiết job
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {application.job?.location && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{application.job.location.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>
                      {getEmploymentTypeLabel(
                        application.job?.employment_type || ""
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>
                      {getExperienceLevelLabel(
                        application.job?.experience_level || ""
                      )}
                    </span>
                  </div>

                  {(application.job?.salary_min ||
                    application.job?.salary_max) && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {application.job.salary_min &&
                        application.job.salary_max
                          ? `${application.job.salary_min.toLocaleString()} - ${application.job.salary_max.toLocaleString()}`
                          : application.job.salary_min
                          ? `Từ ${application.job.salary_min.toLocaleString()}`
                          : `Tối đa ${application.job.salary_max?.toLocaleString()}`}{" "}
                        VNĐ
                      </span>
                    </div>
                  )}
                </div>

                {application.job?.is_remote && (
                  <div className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                    <Globe className="h-4 w-4" />
                    Làm việc từ xa
                  </div>
                )}

                {/* Company Info */}
                {application.job?.company && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Về công ty
                    </h5>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {application.job.company.description ||
                        "Chưa có mô tả về công ty."}
                    </p>
                    {application.job.company.website_url && (
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="p-0 h-auto mt-2"
                      >
                        <a
                          href={application.job.company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Website công ty
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin ứng tuyển</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Ngày ứng tuyển:</span>
                  <span className="text-sm text-gray-600">
                    {format(
                      new Date(application.applied_at),
                      "dd/MM/yyyy HH:mm",
                      { locale: vi }
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Thời gian:</span>
                  <span className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(application.applied_at), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>

                {application.status_updated_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      Cập nhật trạng thái:
                    </span>
                    <span className="text-sm text-gray-600">
                      {format(
                        new Date(application.status_updated_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Trạng thái hiện tại:
                    </span>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                {application.job?.application_deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Hạn ứng tuyển:</span>
                    <span className="text-sm text-gray-600">
                      {format(
                        new Date(application.job.application_deadline),
                        "dd/MM/yyyy",
                        { locale: vi }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            {application.cover_letter && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Thư xin việc:</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {application.cover_letter}
                  </p>
                </div>
              </div>
            )}

            {/* Notes from Employer */}
            {application.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    Ghi chú từ nhà tuyển dụng:
                  </span>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">{application.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Job Description */}
          {application.job?.description && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Mô tả công việc</h3>
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-sm text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: application.job.description,
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Job Requirements */}
          {application.job?.requirements && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Yêu cầu công việc</h3>
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-sm text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: application.job.requirements,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
