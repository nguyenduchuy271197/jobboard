"use client";

import { useState } from "react";
import { useCurrentJobSeekerProfile } from "@/hooks/job-seeker-profiles";
import { useUser } from "@/hooks/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileDialog } from "./profile-dialog";
import { ResumeUpload } from "./resume-upload";
import {
  User,
  DollarSign,
  Globe,
  Github,
  Linkedin,
  Briefcase,
  Edit,
  Plus,
  FileText,
  Mail,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getExperienceLevelLabel, formatSalary } from "@/constants/labels";

export function ProfileContent() {
  const [showDialog, setShowDialog] = useState(false);
  const { data: user } = useUser();
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useCurrentJobSeekerProfile();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (error && !error.message.includes("chưa tạo")) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Có lỗi xảy ra khi tải hồ sơ: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const hasProfile = !!profile;

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {hasProfile ? "Hồ sơ ứng viên" : "Tạo hồ sơ ứng viên"}
            </CardTitle>
            <CardDescription>
              {hasProfile
                ? "Thông tin cá nhân và kinh nghiệm làm việc"
                : "Tạo hồ sơ để bắt đầu tìm kiếm việc làm"}
            </CardDescription>
          </div>
          <Button onClick={() => setShowDialog(true)} size="sm">
            {hasProfile ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Tạo hồ sơ
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {hasProfile ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {profile.headline}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {profile.summary}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.experience_level && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <span className="font-medium">Kinh nghiệm:</span>{" "}
                      {getExperienceLevelLabel(profile.experience_level)}
                    </span>
                  </div>
                )}

                {/* Location will be implemented later */}

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Mức lương:</span>{" "}
                    {formatSalary(
                      profile.preferred_salary_min,
                      profile.preferred_salary_max
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      profile.is_looking_for_job
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {profile.is_looking_for_job
                      ? "Đang tìm việc"
                      : "Không tìm việc"}
                  </span>
                </div>
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Kỹ năng</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Portfolio
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>

              {/* Last Updated */}
              <div className="text-xs text-muted-foreground pt-4 border-t">
                Cập nhật{" "}
                {formatDistanceToNow(new Date(profile.updated_at), {
                  addSuffix: true,
                  locale: vi,
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Chưa có hồ sơ ứng viên
              </h3>
              <p className="text-muted-foreground mb-4">
                Tạo hồ sơ để các nhà tuyển dụng có thể tìm thấy bạn
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo hồ sơ ngay
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Upload Card */}
      {hasProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              CV / Resume
            </CardTitle>
            <CardDescription>
              Upload CV của bạn để tăng cơ hội được tuyển dụng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeUpload currentPath={profile.cv_file_path} />
          </CardContent>
        </Card>
      )}

      {/* Profile Dialog */}
      <ProfileDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        profile={profile}
        onSuccess={() => {
          setShowDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
