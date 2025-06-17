import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { DatabaseJob } from "@/types/custom.types";

interface JobCardProps {
  job: DatabaseJob;
}

export function JobCard({ job }: JobCardProps) {
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

  const timeAgo = formatDistanceToNow(new Date(job.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/jobs/${job.id}`}
              className="block group-hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {job.title}
              </h3>
            </Link>

            {job.company && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{job.company.name}</span>
                {job.company.website_url && (
                  <Link
                    href={job.company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {job.company && (
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage
                src={job.company.logo_url || undefined}
                alt={job.company.name}
              />
              <AvatarFallback>
                {job.company.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Meta Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {job.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{job.location.name}</span>
            </div>
          )}

          {job.industry && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{job.industry.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {formatSalary(job.salary_min, job.salary_max)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {getEmploymentTypeLabel(job.employment_type)}
            </span>
          </div>
        </div>

        {/* Job Description Preview */}
        {job.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {job.experience_level && (
            <Badge variant="secondary" className="text-xs">
              {getExperienceLevelLabel(job.experience_level)}
            </Badge>
          )}

          {job.is_remote && (
            <Badge variant="outline" className="text-xs">
              Làm việc từ xa
            </Badge>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>

            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{job.applications_count} ứng viên</span>
            </div>
          </div>

          <Button asChild size="sm">
            <Link href={`/jobs/${job.id}`}>Xem chi tiết</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
