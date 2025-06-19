import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { checkAuthWithProfile } from "@/lib/auth-utils";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Briefcase,
  Building2,
  Users,
  DollarSign,
  Calendar,
  Edit,
  Eye,
  Globe,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  getEmploymentTypeLabel,
  getExperienceLevelLabel,
  getJobStatusConfig,
} from "@/constants/labels";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const jobId = parseInt(id);

  if (isNaN(jobId)) {
    notFound();
  }

  // Check authentication
  const authCheck = await checkAuthWithProfile();
  if (!authCheck.success) {
    notFound();
  }

  const { user } = authCheck;

  // Fetch job details
  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      company:companies (
        id,
        name,
        logo_url,
        description,
        website_url,
        owner_id
      ),
      location:locations (
        id,
        name
      ),
      industry:industries (
        id,
        name
      )
    `
    )
    .eq("id", jobId)
    .single();

  if (error || !job) {
    notFound();
  }

  // Check if user owns the company that posted the job
  if (job.company?.owner_id !== user.id) {
    notFound();
  }

  // Get application stats
  const { data: applicationStats } = await supabase
    .from("applications")
    .select("status")
    .eq("job_id", jobId);

  const stats = {
    total: applicationStats?.length || 0,
    pending:
      applicationStats?.filter(
        (app) => app.status === "pending" || app.status === "reviewing"
      ).length || 0,
    accepted:
      applicationStats?.filter((app) => app.status === "accepted").length || 0,
    rejected:
      applicationStats?.filter((app) => app.status === "rejected").length || 0,
  };

  const statusInfo = getJobStatusConfig(job.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>
          <p className="text-gray-600">
            Quản lý chi tiết công việc và ứng viên
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/jobs/${jobId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/jobs/${jobId}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Xem trước
            </Link>
          </Button>
        </div>
      </div>

      {/* Job Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin công việc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center">
              {job.company?.logo_url ? (
                <Image
                  src={job.company.logo_url!}
                  alt={job.company?.name || "Company logo"}
                  width={48}
                  height={48}
                  className="rounded object-cover"
                />
              ) : (
                <Building2 className="h-8 w-8 text-gray-500" />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-gray-600">{job.company?.name}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {job.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {job.experience_level
                      ? getExperienceLevelLabel(job.experience_level)
                      : "Không yêu cầu"}
                  </span>
                </div>

                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      {job.salary_min && job.salary_max
                        ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                        : job.salary_min
                        ? `Từ ${job.salary_min.toLocaleString()}`
                        : `Tối đa ${job.salary_max?.toLocaleString()}`}{" "}
                      VNĐ
                    </span>
                  </div>
                )}
              </div>

              {job.is_remote && (
                <div className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                  <Globe className="h-4 w-4" />
                  Làm việc từ xa
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Ngày đăng:</span>
                <span className="text-gray-600">
                  {format(new Date(job.created_at), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </span>
              </div>

              {job.application_deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Hạn ứng tuyển:</span>
                  <span className="text-gray-600">
                    {format(new Date(job.application_deadline), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {job.industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Ngành nghề:</span>
                  <span className="text-gray-600">{job.industry.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">Số lượng tuyển:</span>
                <span className="text-gray-600">1 vị trí</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Application Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Thống kê ứng viên</CardTitle>
          <Button asChild>
            <Link href={`/dashboard/jobs/${jobId}/applicants`}>
              <Users className="h-4 w-4 mr-2" />
              Xem tất cả ứng viên
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Tổng ứng viên</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Đang chờ</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.accepted}
              </div>
              <div className="text-sm text-gray-600">Được chấp nhận</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
              <div className="text-sm text-gray-600">Bị từ chối</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle>Mô tả công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </CardContent>
        </Card>
      )}

      {/* Job Requirements */}
      {job.requirements && (
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: job.requirements }}
            />
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
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: job.benefits }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
