"use client";

import { useJobs } from "@/hooks/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface RelatedJobsProps {
  jobId: string;
}

export function RelatedJobs({ jobId }: RelatedJobsProps) {
  // Fetch related jobs (simplified approach - get latest jobs)
  const { data: jobs, isLoading } = useJobs({
    limit: 5,
    offset: 0,
  });

  // Filter out the current job
  const relatedJobs =
    jobs?.filter((job) => job.id !== parseInt(jobId)).slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Công việc liên quan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="flex gap-1">
                  <div className="h-5 bg-gray-200 rounded w-12"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!relatedJobs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Công việc liên quan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Không có công việc liên quan
          </p>
        </CardContent>
      </Card>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Công việc liên quan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relatedJobs.map((job) => {
            const timeAgo = formatDistanceToNow(new Date(job.created_at), {
              addSuffix: true,
              locale: vi,
            });

            return (
              <div
                key={job.id}
                className="border rounded-lg p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage
                      src={job.company?.logo_url || undefined}
                      alt={job.company?.name || "Company"}
                    />
                    <AvatarFallback>
                      {job.company?.name?.charAt(0).toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="block font-medium text-sm hover:text-primary transition-colors line-clamp-2 leading-tight"
                    >
                      {job.title}
                    </Link>

                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {job.company?.name || "Công ty"}
                    </p>

                    {job.location && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{job.location.name}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="truncate">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-1">
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0.5"
                        >
                          {getEmploymentTypeLabel(job.employment_type)}
                        </Badge>
                        {job.is_remote && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0.5"
                          >
                            Remote
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/jobs">Xem tất cả công việc</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
