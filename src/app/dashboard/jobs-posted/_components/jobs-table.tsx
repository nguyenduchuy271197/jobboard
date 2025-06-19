"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { useCompanyJobs } from "@/hooks/jobs/use-company-jobs";
import { useDeleteJob } from "@/hooks/jobs/use-delete-job";
import { Job, Location, Industry, Company } from "@/types/custom.types";
import { JobFormDialog } from "./job-form-dialog";
import { getEmploymentTypeLabel, formatSalary } from "@/constants/labels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Type for job with joined data
type JobWithJoins = Job & {
  location?: Location;
  industry?: Industry;
  company?: Company;
};

interface JobsTableProps {
  companyId: number;
}

const getStatusBadge = (status: string) => {
  const statusMap = {
    draft: { label: "Bản nháp", variant: "secondary" as const },
    pending_approval: { label: "Chờ duyệt", variant: "outline" as const },
    published: { label: "Đã đăng", variant: "default" as const },
    closed: { label: "Đã đóng", variant: "destructive" as const },
    archived: { label: "Lưu trữ", variant: "secondary" as const },
  };

  const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export function JobsTable({ companyId }: JobsTableProps) {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const {
    data: jobs,
    isLoading,
    error,
  } = useCompanyJobs({ company_id: companyId });

  const deleteJobMutation = useDeleteJob();

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setShowEditDialog(true);
  };

  const handleDelete = async (job: Job) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin "${job.title}"?`)) {
      return;
    }

    try {
      await deleteJobMutation.mutateAsync({ id: job.id });
      toast.success("Đã xóa tin tuyển dụng thành công");
    } catch {
      toast.error("Có lỗi xảy ra khi xóa tin tuyển dụng");
    }
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingJob(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Có lỗi xảy ra khi tải danh sách tin tuyển dụng. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chưa có tin tuyển dụng</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Công ty chưa có tin tuyển dụng nào. Hãy tạo tin đầu tiên!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách tin tuyển dụng ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Mức lương</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Ứng tuyển</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      {(job as JobWithJoins).location && (
                        <div className="text-sm text-muted-foreground">
                          {(job as JobWithJoins).location?.name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getEmploymentTypeLabel(job.employment_type)}
                  </TableCell>
                  <TableCell>
                    {formatSalary(job.salary_min, job.salary_max)}
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {new Date(job.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {job.applications_count}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a
                            href={`/jobs/${job.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem tin
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(job)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(job)}
                          className="text-red-600"
                          disabled={deleteJobMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingJob && (
        <JobFormDialog
          open={showEditDialog}
          onOpenChange={handleCloseEditDialog}
          job={editingJob}
          companies={[
            {
              id: companyId,
              name: (editingJob as JobWithJoins).company?.name || "",
            },
          ]}
          defaultCompanyId={companyId}
        />
      )}
    </>
  );
}
