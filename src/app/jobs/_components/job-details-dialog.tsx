"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Star,
  Globe,
  ExternalLink,
  Briefcase,
  CheckCircle,
  User,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useJob } from "@/hooks/jobs";
import {
  DatabaseJob,
  EmploymentType,
  ExperienceLevel,
} from "@/types/custom.types";
import Image from "next/image";

interface JobDetailsDialogProps {
  jobId: number;
  open: boolean;
  onClose: () => void;
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  full_time: "Toàn thời gian",
  part_time: "Bán thời gian",
  contract: "Hợp đồng",
  freelance: "Freelance",
  internship: "Thực tập",
};

const experienceLevelLabels: Record<ExperienceLevel, string> = {
  entry_level: "Mới bắt đầu",
  mid_level: "Trung cấp",
  senior_level: "Cao cấp",
  executive: "Điều hành",
};

// Extended type to include is_featured which might be computed runtime
type ExtendedDatabaseJob = DatabaseJob & {
  is_featured?: boolean;
};

export function JobDetailsDialog({
  jobId,
  open,
  onClose,
}: JobDetailsDialogProps) {
  const { data: job, isLoading, error } = useJob({ id: jobId, enabled: open });

  const formatSalary = (
    min?: number | null,
    max?: number | null,
    currency?: string | null
  ) => {
    if (!min && !max) return "Thỏa thuận";

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat("vi-VN").format(amount);
    };

    const currencySymbol =
      currency === "USD" ? "$" : currency === "VND" ? "₫" : "";

    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)} ${currencySymbol}`;
    }

    if (min) {
      return `Từ ${formatAmount(min)} ${currencySymbol}`;
    }

    if (max) {
      return `Lên đến ${formatAmount(max)} ${currencySymbol}`;
    }

    return "Thỏa thuận";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Chi Tiết Công Việc</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 px-6">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-muted rounded" />
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-20 bg-muted rounded" />
              <div className="h-40 bg-muted rounded" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Không thể tải thông tin công việc.
              </p>
              <Button variant="outline" onClick={onClose} className="mt-4">
                Đóng
              </Button>
            </div>
          )}

          {job && (
            <div className="space-y-6 pb-6">
              {/* Job Header */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {job.company?.logo_url && (
                    <Image
                      src={job.company.logo_url}
                      alt={job.company.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold">{job.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">
                            {job.company?.name}
                          </span>
                          {job.company?.is_verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Đã xác thực
                            </Badge>
                          )}
                        </div>
                      </div>
                      {(job as ExtendedDatabaseJob).is_featured && (
                        <Badge variant="default" className="text-sm">
                          Nổi bật
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location?.name || "Không xác định"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{employmentTypeLabels[job.employment_type]}</span>
                  </div>

                  {job.experience_level && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{experienceLevelLabels[job.experience_level]}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatDistanceToNow(new Date(job.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>

                {/* Salary & Benefits */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-lg">
                      {formatSalary(
                        job.salary_min,
                        job.salary_max,
                        job.salary_currency
                      )}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {job.is_remote && <Badge variant="outline">Remote</Badge>}
                    {job.industry && (
                      <Badge variant="outline">{job.industry.name}</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Job Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Mô Tả Công Việc
                </h2>
                <div
                  className="prose max-w-none prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: job.description || "Không có mô tả chi tiết.",
                  }}
                />
              </div>

              <Separator />

              {/* Requirements */}
              {job.requirements && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Yêu Cầu Công Việc
                    </h2>
                    <div
                      className="prose max-w-none prose-sm"
                      dangerouslySetInnerHTML={{ __html: job.requirements }}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Benefits */}
              {job.benefits && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Quyền Lợi
                    </h2>
                    <div
                      className="prose max-w-none prose-sm"
                      dangerouslySetInnerHTML={{ __html: job.benefits }}
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* Skills */}
              {job.skills_required && job.skills_required.length > 0 && (
                <>
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Kỹ Năng Yêu Cầu</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills_required.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Company Info */}
              {job.company && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Về Công Ty
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-lg">
                        {job.company.name}
                      </h3>
                      {job.company.website_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={job.company.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                            <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                    {job.company.description && (
                      <p className="text-muted-foreground">
                        {job.company.description}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Application Deadline */}
              {job.application_deadline && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      Hạn nộp hồ sơ:{" "}
                      {new Date(job.application_deadline).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {job && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                ID công việc: #{job.id}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Đóng
                </Button>
                <Button>Ứng Tuyển Ngay</Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
