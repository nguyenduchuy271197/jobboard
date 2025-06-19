"use client";

import { useState, useMemo } from "react";
import {
  DatabaseJobApplication,
  ApplicationStatus,
} from "@/types/custom.types";
import {
  getApplicationStatusConfig,
  getExperienceLevelLabel,
} from "@/constants/labels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApplicantDetailDialog } from "../../jobs/_components/applicant-detail-dialog";
import { Eye, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface CandidatesTableProps {
  applications: DatabaseJobApplication[];
}

export default function CandidatesTable({
  applications,
}: CandidatesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all"
  );
  const [selectedApplication, setSelectedApplication] =
    useState<DatabaseJobApplication | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchTerm === "" ||
        app.applicant?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        app.applicant?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const handleViewDetail = (application: DatabaseJobApplication) => {
    setSelectedApplication(application);
    setShowDetailDialog(true);
  };

  const statusOptions: { value: ApplicationStatus | "all"; label: string }[] = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "reviewing", label: "Đang xem xét" },
    { value: "interviewing", label: "Phỏng vấn" },
    { value: "accepted", label: "Đã nhận" },
    { value: "rejected", label: "Đã từ chối" },
    { value: "withdrawn", label: "Đã rút đơn" },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc vị trí..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as ApplicationStatus | "all")
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Hiển thị {filteredApplications.length} trong tổng số{" "}
        {applications.length} ứng viên
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ứng viên</TableHead>
              <TableHead>Vị trí</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày ứng tuyển</TableHead>
              <TableHead>Kinh nghiệm</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm || statusFilter !== "all"
                    ? "Không tìm thấy ứng viên phù hợp với bộ lọc"
                    : "Chưa có ứng viên nào"}
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((application) => {
                const statusConfig = getApplicationStatusConfig(
                  application.status
                );

                return (
                  <TableRow key={application.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={application.applicant?.avatar_url || undefined}
                          />
                          <AvatarFallback>
                            {application.applicant?.full_name?.charAt(0) ||
                              application.applicant?.email.charAt(0) ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {application.applicant?.full_name ||
                              "Chưa cập nhật"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {application.applicant?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {application.job?.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {application.job?.company?.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(application.applied_at), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>
                      {application.applicant?.job_seeker_profile
                        ?.experience_level
                        ? getExperienceLevelLabel(
                            application.applicant.job_seeker_profile
                              .experience_level
                          )
                        : "Chưa cập nhật"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {selectedApplication && (
        <ApplicantDetailDialog
          application={selectedApplication}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      )}
    </div>
  );
}
