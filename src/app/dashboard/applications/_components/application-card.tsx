"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Clock,
  Briefcase,
  Building2,
  Eye,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { useWithdrawApplication } from "@/hooks/job-applications";
import { toast } from "sonner";
import type { DatabaseJobApplication } from "@/types/custom.types";
import {
  getApplicationStatusConfig,
  getEmploymentTypeLabel,
  formatSalary,
} from "@/constants/labels";

interface ApplicationCardProps {
  application: DatabaseJobApplication;
  onClick: () => void;
}

export function ApplicationCard({
  application,
  onClick,
}: ApplicationCardProps) {
  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn rút lại hồ sơ ứng tuyển này không?"
      )
    ) {
      return;
    }

    try {
      await withdrawMutation.mutateAsync(application.id);
      toast.success("Đã rút lại hồ sơ ứng tuyển thành công");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể rút lại hồ sơ ứng tuyển"
      );
    }
  };

  const canWithdraw =
    application.status === "pending" || application.status === "reviewing";
  const statusInfo = getApplicationStatusConfig(application.status);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={application.job?.company?.logo_url || undefined}
                  alt={application.job?.company?.name || "Company"}
                />
                <AvatarFallback>
                  <Building2 className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {application.job?.title}
                  </h3>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>

                <p className="text-sm text-gray-600 mb-2">
                  {application.job?.company?.name}
                  {application.job?.company?.is_verified && (
                    <span className="ml-1 text-blue-600">✓</span>
                  )}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {application.job?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{application.job.location.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>
                      {getEmploymentTypeLabel(
                        application.job?.employment_type || ""
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Ứng tuyển{" "}
                      {formatDistanceToNow(new Date(application.applied_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>

                {/* Salary info */}
                {(application.job?.salary_min ||
                  application.job?.salary_max) && (
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-medium">Mức lương: </span>
                    {formatSalary(
                      application.job.salary_min,
                      application.job.salary_max
                    )}
                  </div>
                )}

                {/* Notes if any */}
                {application.notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <span className="font-medium text-gray-700">
                      Ghi chú từ nhà tuyển dụng:{" "}
                    </span>
                    <span className="text-gray-600">{application.notes}</span>
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
                onClick();
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Chi tiết
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link href={`/jobs/${application.job?.id}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-1" />
                Xem job
              </Link>
            </Button>

            {canWithdraw && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleWithdraw}
                disabled={withdrawMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {withdrawMutation.isPending ? "Đang rút..." : "Rút lại"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
