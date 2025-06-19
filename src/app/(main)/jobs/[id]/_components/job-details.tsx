"use client";

import { useJob } from "@/hooks/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ApplyJobDialog } from "@/components/apply-job-dialog";
import {
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Calendar,
  Globe,
  AlertCircle,
  Check,
  Share2,
  Bookmark,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

interface JobDetailsProps {
  jobId: string;
}

export function JobDetails({ jobId }: JobDetailsProps) {
  const { data: job, isLoading, error } = useJob({ id: parseInt(jobId) });

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Có lỗi xảy ra khi tải thông tin công việc. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!job) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Không tìm thấy thông tin công việc.</AlertDescription>
      </Alert>
    );
  }

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Thỏa thuận";

    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
      }
      return new Intl.NumberFormat("vi-VN").format(num);
    };

    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} VNĐ`;
    }
    if (min) {
      return `Từ ${formatNumber(min)} VNĐ`;
    }
    if (max) {
      return `Lên đến ${formatNumber(max)} VNĐ`;
    }
    return "Thỏa thuận";
  };

  const getEmploymentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      full_time: "Toàn thời gian",
      part_time: "Bán thời gian",
      contract: "Hợp đồng",
      internship: "Thực tập",
      freelance: "Freelance",
    };
    return types[type] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const levels: Record<string, string> = {
      entry_level: "Mới ra trường",
      mid_level: "Trung cấp",
      senior_level: "Cao cấp",
      executive: "Quản lý",
    };
    return levels[level] || level;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Xem công việc: ${job.title} tại ${
            job.company?.name || "Công ty"
          }`,
          url: window.location.href,
        });
      } catch {
        // User cancelled the share
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép link vào clipboard!");
    }
  };

  const timeAgo = formatDistanceToNow(new Date(job.created_at), {
    addSuffix: true,
    locale: vi,
  });

  const deadline = job.application_deadline
    ? format(new Date(job.application_deadline), "dd/MM/yyyy", { locale: vi })
    : null;

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-tight mb-2">
                {job.title}
              </h1>

              {job.company && (
                <div className="flex items-center gap-2 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={job.company.logo_url || undefined}
                      alt={job.company.name}
                    />
                    <AvatarFallback>
                      {job.company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/companies/${job.company.id}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {job.company.name}
                    </Link>
                    {job.company.website_url && (
                      <Link
                        href={job.company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 ml-2 text-sm text-muted-foreground hover:text-primary"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {job.experience_level && (
                  <Badge variant="secondary">
                    {getExperienceLevelLabel(job.experience_level)}
                  </Badge>
                )}
                <Badge variant="outline">
                  {getEmploymentTypeLabel(job.employment_type)}
                </Badge>
                {job.is_remote && (
                  <Badge variant="outline">Làm việc từ xa</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {job.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{job.location.name}</span>
                  </div>
                )}

                {job.industry && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                    <span>{job.industry.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{timeAgo}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-3">
            <ApplyJobDialog job={job}>
              <Button size="lg" className="flex-1 min-w-fit">
                <Check className="h-4 w-4 mr-2" />
                Ứng tuyển ngay
              </Button>
            </ApplyJobDialog>

            <Button variant="outline" size="lg" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>

            <Button variant="outline" size="lg">
              <Bookmark className="h-4 w-4 mr-2" />
              Lưu
            </Button>
          </div>

          {deadline && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Hạn nộp hồ sơ: {deadline}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Mô tả công việc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: job.description || "Chưa có mô tả.",
              }}
              className="text-sm leading-relaxed"
            />
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
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: job.requirements }}
                className="text-sm leading-relaxed"
              />
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
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: job.benefits }}
                className="text-sm leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Info */}
      {job.company && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin công ty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={job.company.logo_url || undefined}
                  alt={job.company.name}
                />
                <AvatarFallback>
                  {job.company.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {job.company.name}
                </h3>
                {job.company.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                    {job.company.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {job.company.website_url && (
                    <Link
                      href={job.company.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="text-center">
              <Button asChild variant="outline">
                <Link href={`/companies/${job.company.id}`}>
                  Xem thêm về công ty
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
