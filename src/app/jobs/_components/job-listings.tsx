"use client";

import { useState } from "react";
import { useJobs } from "@/hooks/jobs";
import { JobCard } from "./job-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Grid3X3, List, AlertCircle, Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface JobListingsProps {
  searchParams: {
    search?: string;
    industry?: string;
    location?: string;
    employment_type?: string;
    experience_level?: string;
    salary_min?: string;
    salary_max?: string;
    is_remote?: string;
    page?: string;
    sort?: string;
    order?: string;
  };
}

const ITEMS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: "created_at_desc", label: "Mới nhất" },
  { value: "created_at_asc", label: "Cũ nhất" },
  { value: "applications_count_desc", label: "Nhiều ứng viên nhất" },
  { value: "applications_count_asc", label: "Ít ứng viên nhất" },
];

export function JobListings({ searchParams }: JobListingsProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const currentPage = parseInt(searchParams.page || "1");
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Convert searchParams to hook params
  const queryParams = {
    search: searchParams.search,
    industry_id: searchParams.industry
      ? parseInt(searchParams.industry)
      : undefined,
    location_id: searchParams.location
      ? parseInt(searchParams.location)
      : undefined,
    employment_type: searchParams.employment_type as
      | "full_time"
      | "part_time"
      | "contract"
      | "internship"
      | "freelance"
      | undefined,
    experience_level: searchParams.experience_level as
      | "entry_level"
      | "mid_level"
      | "senior_level"
      | "executive"
      | undefined,
    salary_min: searchParams.salary_min
      ? parseInt(searchParams.salary_min)
      : undefined,
    salary_max: searchParams.salary_max
      ? parseInt(searchParams.salary_max)
      : undefined,
    is_remote: searchParams.is_remote === "true" ? true : undefined,
    limit: ITEMS_PER_PAGE,
    offset,
  };

  const { data: jobs, isLoading, error } = useJobs(queryParams);

  const updateSort = (sortValue: string) => {
    const params = new URLSearchParams(urlSearchParams);
    const [field, order] = sortValue.split("_");
    params.set("sort", field);
    params.set("order", order.replace("desc", "desc").replace("asc", "asc"));
    params.delete("page"); // Reset page when sorting
    router.push(`/jobs?${params.toString()}`);
  };

  const updatePage = (page: number) => {
    const params = new URLSearchParams(urlSearchParams);
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    router.push(`/jobs?${params.toString()}`);
  };

  const totalPages = Math.ceil((jobs?.length || 0) / ITEMS_PER_PAGE);
  const hasFilters = Object.entries(searchParams).some(
    ([key, value]) => key !== "page" && value
  );

  if (isLoading) {
    return <JobListingsSkeleton />;
  }

  if (error) {
    return (
      <Alert className="border-destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Có lỗi xảy ra khi tải danh sách công việc. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Không tìm thấy công việc
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasFilters
              ? "Không có công việc nào phù hợp với tiêu chí tìm kiếm. Hãy thử điều chỉnh bộ lọc."
              : "Hiện tại chưa có công việc nào được đăng tuyển."}
          </p>
          {hasFilters && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/jobs")}
            >
              Xóa tất cả bộ lọc
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Tìm thấy {jobs.length} công việc
          </h2>
          {hasFilters && (
            <p className="text-sm text-muted-foreground">
              Kết quả tìm kiếm với bộ lọc đã chọn
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <Select
            value={`${searchParams.sort || "created_at"}_${
              searchParams.order || "desc"
            }`}
            onValueChange={updateSort}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sắp xếp theo" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
            : "space-y-4"
        }
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => updatePage(currentPage - 1)}
                  />
                </PaginationItem>
              )}

              {/* Page Numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => updatePage(pageNumber)}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => updatePage(currentPage + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

function JobListingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-12 w-12 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
