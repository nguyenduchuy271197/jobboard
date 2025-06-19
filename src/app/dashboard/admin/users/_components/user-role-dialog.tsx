"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ShieldCheck, ShieldOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useUpdateUserRole } from "@/hooks/admin/users";
import type { Profile } from "@/types/custom.types";

interface UserRoleDialogProps {
  user: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserRoleDialog({
  user,
  open,
  onOpenChange,
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<string>(user.role);
  const updateRoleMutation = useUpdateUserRole();

  const roles = [
    {
      value: "job_seeker",
      label: "Ứng viên",
      description: "Có thể tìm kiếm và ứng tuyển công việc",
      icon: Shield,
      badge: <Badge variant="secondary">Ứng viên</Badge>,
    },
    {
      value: "employer",
      label: "Nhà tuyển dụng",
      description: "Có thể đăng tin tuyển dụng và quản lý ứng viên",
      icon: ShieldCheck,
      badge: <Badge variant="default">Nhà tuyển dụng</Badge>,
    },
    {
      value: "admin",
      label: "Quản trị viên",
      description: "Có quyền quản lý toàn bộ hệ thống",
      icon: ShieldOff,
      badge: <Badge variant="destructive">Admin</Badge>,
    },
  ];

  const handleSave = async () => {
    if (selectedRole === user.role) {
      onOpenChange(false);
      return;
    }

    try {
      const result = await updateRoleMutation.mutateAsync({
        user_id: user.id,
        role: selectedRole as "job_seeker" | "employer" | "admin",
      });

      if (result.success) {
        toast.success(
          `Đã thay đổi vai trò của ${user.full_name || user.email} thành ${
            roles.find((r) => r.value === selectedRole)?.label
          }`
        );
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi thay đổi vai trò");
    }
  };

  const handleClose = () => {
    setSelectedRole(user.role); // Reset to original role
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thay đổi vai trò người dùng</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Avatar>
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>
                {user.full_name?.charAt(0) || user.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.full_name || "Chưa cập nhật"}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Current Role */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Vai trò hiện tại:</p>
            {roles.find((r) => r.value === user.role)?.badge}
          </div>

          {/* Role Selection */}
          <div>
            <p className="text-sm font-medium mb-3">Chọn vai trò mới:</p>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.value}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        selectedRole === role.value
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <RadioGroupItem
                        value={role.value}
                        id={role.value}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={role.value} className="cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{role.label}</span>
                            {role.badge}
                          </div>
                          <p className="text-sm text-gray-500">
                            {role.description}
                          </p>
                        </Label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Warning for Admin Role */}
          {selectedRole === "admin" && user.role !== "admin" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Cảnh báo: Vai trò Admin sẽ có quyền truy cập đầy đủ vào hệ
                thống. Hãy chắc chắn người dùng này đáng tin cậy.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              updateRoleMutation.isPending || selectedRole === user.role
            }
          >
            {updateRoleMutation.isPending
              ? "Đang cập nhật..."
              : "Cập nhật vai trò"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
