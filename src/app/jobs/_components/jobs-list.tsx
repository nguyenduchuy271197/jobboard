"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
} from "lucide-react";
import { useJobs } from "@/hooks/jobs";
import { JobDetailsDialog } from "./job-details-dialog";
import { JobsLoading } from "./jobs-loading";
import { JobSearchFilters } from "./jobs-search";
import {
  DatabaseJob,
  EmploymentType,
  ExperienceLevel,
} from "@/types/custom.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface JobsListProps {
  filters?: JobSearchFilters;
}

const JOBS_PER_PAGE = 10;

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

export function JobsList({ filters = {} }: JobsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const offset = (currentPage - 1) * JOBS_PER_PAGE;

  const {
    data: jobs = [],
    isLoading,
    error,
  } = useJobs({
    ...filters,
    limit: JOBS_PER_PAGE,
    offset,
    status: "published",
  });

  const handleJobClick = (jobId: number) => {
    setSelectedJobId(jobId);
  };

  const handleCloseDialog = () => {
    setSelectedJobId(null);
  };

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

  if (isLoading) {
    return <JobsLoading />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Có lỗi xảy ra khi tải danh sách công việc. Vui lòng thử lại.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Không tìm thấy công việc
              </h3>
              <p className="text-muted-foreground">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để có kết quả tốt
                hơn.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const showPagination = totalPages > 1;

  return (
    <div className="space-y-6">
      {/* Job Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Hiển thị {jobs.length} công việc
          {filters.search && <span> cho từ khóa "{filters.search}"</span>}
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onJobClick={handleJobClick}
            formatSalary={formatSalary}
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Job Details Dialog */}
      {selectedJobId && (
        <JobDetailsDialog
          jobId={selectedJobId}
          open={!!selectedJobId}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}

interface JobCardProps {
  job: DatabaseJob;
  onJobClick: (jobId: number) => void;
  formatSalary: (
    min?: number | null,
    max?: number | null,
    currency?: string | null
  ) => string;
}

function JobCard({ job, onJobClick, formatSalary }: JobCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onJobClick(job.id)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              {job.company?.logo_url && (
                <img
                  src={job.company.logo_url}
                  alt={job.company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>{job.company?.name}</span>
                      {job.company?.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Đã xác thực
                        </Badge>
                      )}
                    </div>
                  </div>
                  {job.is_featured && <Badge variant="default">Nổi bật</Badge>}
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {job.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location.name}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{employmentTypeLabels[job.employment_type]}</span>
              </div>

              {job.experience_level && (
                <Badge variant="outline">
                  {experienceLevelLabels[job.experience_level]}
                </Badge>
              )}

              {job.is_remote && <Badge variant="outline">Remote</Badge>}
            </div>

            {/* Description Preview */}
            <p className="text-muted-foreground line-clamp-2">
              {job.description?.replace(/(<([^>]+)>)/gi, "").substring(0, 150)}
              ...
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-primary font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>
                  {formatSalary(
                    job.salary_min,
                    job.salary_max,
                    job.salary_currency
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(job.created_at), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
