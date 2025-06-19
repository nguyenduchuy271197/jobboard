"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  Eye,
  UserCog,
  UserX,
  UserCheck,
  Shield,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { UserDetailsDialog } from "./user-details-dialog";
import { UserRoleDialog } from "./user-role-dialog";
import { useActivateUser, useDeactivateUser } from "@/hooks/admin/users";
import type { Profile } from "@/types/custom.types";

interface UsersTableProps {
  users: Profile[];
  isLoading: boolean;
}

export function UsersTable({ users, isLoading }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const activateUserMutation = useActivateUser();
  const deactivateUserMutation = useDeactivateUser();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "job_seeker":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Ứng viên
          </Badge>
        );
      case "employer":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            Nhà tuyển dụng
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <ShieldOff className="h-3 w-3" />
            Admin
          </Badge>
        );
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

  const handleToggleStatus = async (user: Profile) => {
    try {
      if (user.is_active) {
        const result = await deactivateUserMutation.mutateAsync({
          user_id: user.id,
        });
        if (result.success) {
          toast.success(
            `Đã vô hiệu hóa tài khoản ${user.full_name || user.email}`
          );
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await activateUserMutation.mutateAsync({
          user_id: user.id,
        });
        if (result.success) {
          toast.success(
            `Đã kích hoạt tài khoản ${user.full_name || user.email}`
          );
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái");
    }
  };

  const handleViewDetails = (user: Profile) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleChangeRole = (user: Profile) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[100px]">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.full_name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.full_name || "Chưa cập nhật"}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(user.created_at), "dd/MM/yyyy", {
                      locale: vi,
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(user.created_at), "HH:mm", { locale: vi })}
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
                      <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeRole(user)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Thay đổi vai trò
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(user)}
                        className={
                          user.is_active ? "text-red-600" : "text-green-600"
                        }
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Vô hiệu hóa
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Kích hoạt
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {selectedUser && (
        <>
          <UserDetailsDialog
            user={selectedUser}
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          />
          <UserRoleDialog
            user={selectedUser}
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
          />
        </>
      )}
    </>
  );
}
