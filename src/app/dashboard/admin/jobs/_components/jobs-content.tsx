"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAllJobs,
  usePendingJobs,
  useJobStatistics,
} from "@/hooks/admin/jobs";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { JobsTable } from "./jobs-table";
import {
  Briefcase,
  Clock,
  CheckCircle,
  Archive,
  Search,
  Filter,
} from "lucide-react";
import type { AdminJobsFilter } from "@/types/custom.types";

export function JobsContent() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    | "draft"
    | "pending_approval"
    | "published"
    | "closed"
    | "archived"
    | undefined
  >(undefined);

  const debouncedSearch = useDebounce(search, 500);

  const allJobsFilters: AdminJobsFilter = {
    search: debouncedSearch || undefined,
    status,
    limit: 20,
    offset: 0,
  };

  const pendingJobsFilters: AdminJobsFilter = {
    search: debouncedSearch || undefined,
    status: "pending_approval",
    limit: 20,
    offset: 0,
  };

  const {
    data: allJobsData,
    isLoading: allJobsLoading,
    error: allJobsError,
  } = useAllJobs(activeTab === "all" ? allJobsFilters : pendingJobsFilters);

  const { data: pendingJobsData, isLoading: pendingJobsLoading } =
    usePendingJobs();

  const { data: statsData, isLoading: statsLoading } = useJobStatistics();

  const jobs = allJobsData?.jobs || [];
  const total = allJobsData?.total || 0;
  const pendingCount = pendingJobsData?.length || 0;

  if (allJobsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra: {allJobsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng tin tuyển dụng
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsData?.total_jobs || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{statsData?.new_jobs_this_month || 0} tin mới tháng này
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pendingJobsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {pendingCount}
                </div>
                <p className="text-xs text-muted-foreground">Cần xét duyệt</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã đăng</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {statsData?.published_jobs || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đang hiển thị công khai
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã lưu trữ</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsData?.archived_jobs || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Không còn hiển thị
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={status || "all"}
              onValueChange={(value) =>
                setStatus(
                  value === "all"
                    ? undefined
                    : (value as
                        | "draft"
                        | "pending_approval"
                        | "published"
                        | "closed"
                        | "archived")
                )
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                <SelectItem value="published">Đã đăng</SelectItem>
                <SelectItem value="closed">Đã đóng</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatus(undefined);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Tabs */}
      <Card>
        <CardHeader>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all">Tất cả tin ({total})</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Chờ duyệt
                {pendingCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <JobsTable
                jobs={jobs}
                isLoading={allJobsLoading}
                showAllActions={true}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <JobsTable
                jobs={jobs}
                isLoading={allJobsLoading}
                showAllActions={false}
                showApprovalActions={true}
              />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
}
