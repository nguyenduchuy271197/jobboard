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
import { useAllUsers, useUserStatistics } from "@/hooks/admin/users";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersTable } from "./users-table";
import { Users, UserCheck, UserX, Search, Filter } from "lucide-react";
import type { AdminUsersFilter } from "@/types/custom.types";

export function UsersContent() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<
    "job_seeker" | "employer" | "admin" | undefined
  >(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 500);

  const filters: AdminUsersFilter = {
    search: debouncedSearch || undefined,
    role,
    is_active: isActive,
    limit: 20,
    offset: 0,
  };

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useAllUsers(filters);

  const { data: statsData, isLoading: statsLoading } = useUserStatistics();

  const users = (usersData?.success ? usersData.data.users : []) || [];
  const total = (usersData?.success ? usersData.data.total : 0) || 0;

  if (usersError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra: {usersError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người dùng
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(statsData?.success ? statsData.data.total_users : 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +
                  {(statsData?.success
                    ? statsData.data.new_users_this_month
                    : 0) || 0}{" "}
                  người dùng mới tháng này
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đang hoạt động
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(statsData?.success ? statsData.data.active_users : 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.success && statsData.data.total_users
                    ? Math.round(
                        (statsData.data.active_users /
                          statsData.data.total_users) *
                          100
                      )
                    : 0}
                  % tổng số người dùng
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bị vô hiệu hóa
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(statsData?.success ? statsData.data.inactive_users : 0) ||
                    0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {statsData?.success && statsData.data.total_users
                    ? Math.round(
                        (statsData.data.inactive_users /
                          statsData.data.total_users) *
                          100
                      )
                    : 0}
                  % tổng số người dùng
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
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={role || "all"}
              onValueChange={(value) =>
                setRole(
                  value === "all"
                    ? undefined
                    : (value as "job_seeker" | "employer" | "admin")
                )
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="job_seeker">Ứng viên</SelectItem>
                <SelectItem value="employer">Nhà tuyển dụng</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={
                isActive === undefined
                  ? "all"
                  : isActive
                  ? "active"
                  : "inactive"
              }
              onValueChange={(value) =>
                setIsActive(value === "all" ? undefined : value === "active")
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Bị vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setRole(undefined);
                setIsActive(undefined);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách người dùng ({total})</span>
            <Badge variant="outline">{users.length} hiển thị</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} isLoading={usersLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
