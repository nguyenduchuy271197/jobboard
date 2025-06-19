"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
} from "lucide-react";
import type { DatabaseJob } from "@/types/custom.types";

interface JobDetailsDialogProps {
  job: DatabaseJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsDialog({
  job,
  open,
  onOpenChange,
}: JobDetailsDialogProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="text-gray-600">
            Bản nháp
          </Badge>
        );
      case "pending_approval":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200 bg-orange-50"
          >
            Chờ duyệt
          </Badge>
        );
      case "published":
        return (
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 bg-green-50"
          >
            Đã đăng
          </Badge>
        );
      case "closed":
        return (
          <Badge
            variant="outline"
            className="text-blue-600 border-blue-200 bg-blue-50"
          >
            Đã đóng
          </Badge>
        );
      case "archived":
        return (
          <Badge
            variant="outline"
            className="text-gray-600 border-gray-200 bg-gray-50"
          >
            Lưu trữ
          </Badge>
        );
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatSalary = (minSalary: number | null, maxSalary: number | null) => {
    if (!minSalary && !maxSalary) return "Thương lượng";
    if (minSalary && maxSalary) {
      return `${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()} VNĐ`;
    }
    if (minSalary) return `Từ ${minSalary.toLocaleString()} VNĐ`;
    if (maxSalary) return `Tối đa ${maxSalary.toLocaleString()} VNĐ`;
    return "Thương lượng";
  };

  const getJobTypeBadge = (type: string) => {
    switch (type) {
      case "full_time":
        return <Badge variant="default">Toàn thời gian</Badge>;
      case "part_time":
        return <Badge variant="secondary">Bán thời gian</Badge>;
      case "contract":
        return <Badge variant="outline">Hợp đồng</Badge>;
      case "freelance":
        return <Badge variant="outline">Freelance</Badge>;
      case "internship":
        return <Badge variant="secondary">Thực tập</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết tin tuyển dụng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(job.status)}
                {getJobTypeBadge(job.employment_type)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Building2 className="h-4 w-4" />
                <span>
                  {typeof job.company === "object"
                    ? job.company.name
                    : "Không xác định"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>
                  {typeof job.location === "object"
                    ? job.location.name
                    : job.location || "Không xác định"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-green-600">
                  {formatSalary(job.salary_min, job.salary_max)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span>
                  {typeof job.industry === "object"
                    ? job.industry.name
                    : job.industry || "Không xác định"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Mô tả công việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{job.description}</div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Yêu cầu công việc</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{job.requirements}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle>Quyền lợi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap">{job.benefits}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Thông tin thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="font-medium">
                    {format(
                      new Date(job.created_at),
                      "dd/MM/yyyy 'lúc' HH:mm",
                      { locale: vi }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Cập nhật cuối</p>
                  <p className="font-medium">
                    {format(
                      new Date(job.updated_at),
                      "dd/MM/yyyy 'lúc' HH:mm",
                      { locale: vi }
                    )}
                  </p>
                </div>

                {job.application_deadline && (
                  <div>
                    <p className="text-sm text-gray-500">Hạn ứng tuyển</p>
                    <p className="font-medium">
                      {format(
                        new Date(job.application_deadline),
                        "dd/MM/yyyy",
                        {
                          locale: vi,
                        }
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thông tin khác
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Loại hình công việc</p>
                  <div className="mt-1">
                    {getJobTypeBadge(job.employment_type)}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Kinh nghiệm yêu cầu</p>
                  <p className="font-medium">
                    {job.experience_level || "Không yêu cầu"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Trạng thái</p>
                  <div className="mt-1">{getStatusBadge(job.status)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
