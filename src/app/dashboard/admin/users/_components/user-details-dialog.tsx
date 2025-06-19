"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Mail,
  Calendar,
  Shield,
  User,
  Phone,
  UserCheck,
  UserX,
} from "lucide-react";
import type { Profile } from "@/types/custom.types";

interface UserDetailsDialogProps {
  user: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({
  user,
  open,
  onOpenChange,
}: UserDetailsDialogProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "job_seeker":
        return <Badge variant="secondary">Ứng viên</Badge>;
      case "employer":
        return <Badge variant="default">Nhà tuyển dụng</Badge>;
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge
        variant="outline"
        className="text-green-600 border-green-200 bg-green-50"
      >
        <UserCheck className="h-3 w-3 mr-1" />
        Hoạt động
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="text-red-600 border-red-200 bg-red-50"
      >
        <UserX className="h-3 w-3 mr-1" />
        Vô hiệu hóa
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {user.full_name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {user.full_name || "Chưa cập nhật tên"}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.is_active)}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Vai trò</p>
                    <div className="mt-1">{getRoleBadge(user.role)}</div>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thông tin tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
                  <p className="font-medium">
                    {format(
                      new Date(user.created_at),
                      "dd/MM/yyyy 'lúc' HH:mm",
                      { locale: vi }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Lần cập nhật cuối</p>
                  <p className="font-medium">
                    {format(
                      new Date(user.updated_at),
                      "dd/MM/yyyy 'lúc' HH:mm",
                      { locale: vi }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Trạng thái tài khoản</p>
                  <div className="mt-1">{getStatusBadge(user.is_active)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
