"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  Trash2,
  Building,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { JobDetailsDialog } from "./job-details-dialog";
import {
  useApproveJob,
  useRejectJob,
  useArchiveJob,
  useDeleteJob,
} from "@/hooks/admin/jobs";
import type { DatabaseJob } from "@/types/custom.types";

interface JobsTableProps {
  jobs: DatabaseJob[];
  isLoading: boolean;
  showAllActions?: boolean;
  showApprovalActions?: boolean;
}

export function JobsTable({
  jobs,
  isLoading,
  showAllActions = true,
  showApprovalActions = false,
}: JobsTableProps) {
  const [selectedJob, setSelectedJob] = useState<DatabaseJob | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const approveJobMutation = useApproveJob();
  const rejectJobMutation = useRejectJob();
  const archiveJobMutation = useArchiveJob();
  const deleteJobMutation = useDeleteJob();

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

  const handleApprove = async (job: DatabaseJob) => {
    try {
      const result = await approveJobMutation.mutateAsync({ job_id: job.id });
      if (result.success) {
        toast.success(`Đã duyệt tin tuyển dụng "${job.title}"`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi duyệt tin tuyển dụng");
    }
  };

  const handleReject = async (job: DatabaseJob) => {
    try {
      const result = await rejectJobMutation.mutateAsync({ job_id: job.id });
      if (result.success) {
        toast.success(`Đã từ chối tin tuyển dụng "${job.title}"`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi từ chối tin tuyển dụng");
    }
  };

  const handleArchive = async (job: DatabaseJob) => {
    try {
      const result = await archiveJobMutation.mutateAsync(job.id);
      if (result.success) {
        toast.success(`Đã lưu trữ tin tuyển dụng "${job.title}"`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu trữ tin tuyển dụng");
    }
  };

  const handleDelete = async (job: DatabaseJob) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin tuyển dụng "${job.title}"?`)) {
      return;
    }

    try {
      const result = await deleteJobMutation.mutateAsync({ job_id: job.id });
      if (result.success) {
        toast.success(`Đã xóa tin tuyển dụng "${job.title}"`);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa tin tuyển dụng");
    }
  };

  const handleViewDetails = (job: DatabaseJob) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy tin tuyển dụng nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tin tuyển dụng</TableHead>
              <TableHead>Công ty</TableHead>
              <TableHead>Mức lương</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 line-clamp-1">
                      {job.title}
                    </div>
                    {/* <div className="text-sm text-gray-500 line-clamp-2">
                      {job.description}
                    </div> */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {job.industry && (
                        <span className="inline-flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {typeof job.industry === "object"
                            ? job.industry.name
                            : job.industry}
                        </span>
                      )}
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          📍{" "}
                          {typeof job.location === "object"
                            ? job.location.name
                            : job.location}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {typeof job.company === "object"
                      ? job.company.name
                      : "Không xác định"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-green-600">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(job.created_at), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(job.created_at), "HH:mm", { locale: vi })}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(job)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>

                      {showApprovalActions &&
                        job.status === "pending_approval" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleApprove(job)}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Duyệt tin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReject(job)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Từ chối
                            </DropdownMenuItem>
                          </>
                        )}

                      {showAllActions && (
                        <>
                          <DropdownMenuSeparator />
                          {job.status === "pending_approval" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(job)}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Duyệt tin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(job)}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Từ chối
                              </DropdownMenuItem>
                            </>
                          )}

                          {job.status !== "archived" && (
                            <DropdownMenuItem
                              onClick={() => handleArchive(job)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Lưu trữ
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem
                            onClick={() => handleDelete(job)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Job Details Dialog */}
      {selectedJob && (
        <JobDetailsDialog
          job={selectedJob}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </>
  );
}
