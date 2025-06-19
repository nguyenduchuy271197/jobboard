"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Profile } from "@/types/custom.types";
import {
  LayoutDashboard,
  User,
  Building,
  Briefcase,
  FileText,
  LogOut,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLogout } from "@/hooks/auth/use-logout";
import { toast } from "sonner";

interface DashboardSidebarProps {
  profile: Profile;
}

export default function DashboardSidebar({ profile }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      const result = await logoutMutation.mutateAsync();
      if (result.success) {
        toast.success("Đăng xuất thành công");
        router.push("/auth/login");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Đã có lỗi xảy ra khi đăng xuất");
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["job_seeker", "employer", "admin"],
    },
    {
      name: "Hồ sơ cá nhân",
      href: "/dashboard/profile",
      icon: User,
      roles: ["job_seeker"],
    },
    {
      name: "Đơn ứng tuyển",
      href: "/dashboard/applications",
      icon: FileText,
      roles: ["job_seeker"],
    },
    // Employer specific
    {
      name: "Công ty",
      href: "/dashboard/company",
      icon: Building,
      roles: ["employer"],
    },
    {
      name: "Tin tuyển dụng",
      href: "/dashboard/jobs",
      icon: Briefcase,
      roles: ["employer"],
    },
    {
      name: "Ứng viên",
      href: "/dashboard/candidates",
      icon: Users,
      roles: ["employer"],
    },
    // Admin specific
    {
      name: "Quản lý người dùng",
      href: "/dashboard/admin/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Quản lý công việc",
      href: "/dashboard/admin/jobs",
      icon: Briefcase,
      roles: ["admin"],
    },
    {
      name: "Quản lý danh mục",
      href: "/dashboard/admin/categories",
      icon: Tags,
      roles: ["admin"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(profile.role)
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "job_seeker":
        return <Badge variant="secondary">Ứng viên</Badge>;
      case "employer":
        return <Badge variant="default">Nhà tuyển dụng</Badge>;
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.full_name?.charAt(0) || profile.email.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.full_name || "Chưa cập nhật"}
              </p>
              <div className="mt-1">{getRoleBadge(profile.role)}</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <item.icon
                className={cn("h-5 w-5 flex-shrink-0", !collapsed && "mr-3")}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed && "justify-center"
          )}
        >
          <LogOut className={cn("h-5 w-5", !collapsed && "mr-3")} />
          {!collapsed && "Đăng xuất"}
        </Button>
      </div>
    </div>
  );
}
