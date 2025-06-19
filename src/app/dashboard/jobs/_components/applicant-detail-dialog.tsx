"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import type { DatabaseJobApplication } from "@/types/custom.types";
import { getApplicationStatusConfig } from "@/constants/labels";
import { useUpdateApplicationStatus } from "@/hooks/job-applications";

interface ApplicantDetailDialogProps {
  application: DatabaseJobApplication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicantDetailDialog({
  application,
  open,
  onOpenChange,
}: ApplicantDetailDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.notes || "");

  const updateStatusMutation = useUpdateApplicationStatus();
  const statusInfo = getApplicationStatusConfig(application.status);

  const handleStatusUpdate = async () => {
    if (
      selectedStatus === application.status &&
      notes === (application.notes || "")
    ) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: application.id,
        status: selectedStatus,
        notes: notes.trim() || undefined,
      });
      toast.success("Đã cập nhật trạng thái ứng tuyển thành công");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái ứng tuyển"
      );
    }
  };

  const profile = application.applicant;
  const jobSeekerProfile = profile?.job_seeker_profile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết ứng viên
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về ứng viên cho vị trí: {application.job?.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Applicant Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>

            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile?.avatar_url || undefined}
                  alt={profile?.full_name || "Applicant"}
                />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {profile?.full_name || "Chưa cập nhật tên"}
                  </h4>
                  <p className="text-gray-600">
                    {jobSeekerProfile?.headline || "Chưa có chức danh"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {profile?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${profile.email}`}
                        className="hover:text-blue-600"
                      >
                        {profile.email}
                      </a>
                    </div>
                  )}

                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <a
                        href={`tel:${profile.phone}`}
                        className="hover:text-blue-600"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  )}

                  {jobSeekerProfile?.preferred_location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{jobSeekerProfile.preferred_location.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Ứng tuyển{" "}
                      {formatDistanceToNow(new Date(application.applied_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>

                {/* Skills */}
                {jobSeekerProfile?.skills && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">
                      Kỹ năng:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {jobSeekerProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* CV/Resume */}
                {jobSeekerProfile?.cv_file_path && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/api/files/${jobSeekerProfile.cv_file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Tải CV
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Summary */}
          {jobSeekerProfile?.summary && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tóm tắt chuyên môn</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {jobSeekerProfile.summary}
                </p>
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {application.cover_letter && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thư xin việc</h3>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {application.cover_letter}
                  </p>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Status Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quản lý trạng thái</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="status">Trạng thái ứng tuyển</Label>
                <Select
                  value={selectedStatus}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onValueChange={(value) => setSelectedStatus(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="reviewing">Đang xem xét</SelectItem>
                    <SelectItem value="interviewing">Phỏng vấn</SelectItem>
                    <SelectItem value="accepted">Chấp nhận</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thêm ghi chú về ứng viên..."
                  rows={3}
                />
              </div>
            </div>

            {/* Application Timeline */}
            <div className="space-y-2">
              <Label>Lịch sử ứng tuyển</Label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    Ứng tuyển vào{" "}
                    {format(
                      new Date(application.applied_at),
                      "dd/MM/yyyy HH:mm",
                      { locale: vi }
                    )}
                  </span>
                </div>
                {application.status_updated_at && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>
                      Cập nhật trạng thái lần cuối vào{" "}
                      {format(
                        new Date(application.status_updated_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Notes */}
            {application.notes && (
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Ghi chú hiện tại:
                  </span>
                </div>
                <p className="text-sm text-yellow-800">{application.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={
                  updateStatusMutation.isPending ||
                  (selectedStatus === application.status &&
                    notes === (application.notes || ""))
                }
              >
                {updateStatusMutation.isPending
                  ? "Đang cập nhật..."
                  : "Cập nhật"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
