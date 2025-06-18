"use client";

import { useState } from "react";
import { useUserCompanies } from "@/hooks/companies/use-user-companies";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Building2,
  Globe,
  MapPin,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CompanyDialog from "./company-dialog";
import { Company } from "@/types/custom.types";

interface CompanyContentProps {
  userId: string;
}

export default function CompanyContent({}: CompanyContentProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: companies, isLoading, error, refetch } = useUserCompanies();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Đã có lỗi xảy ra khi tải danh sách công ty. Vui lòng thử lại.
        </AlertDescription>
      </Alert>
    );
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedCompany(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Companies List */}
      {companies?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Chưa có công ty nào</h3>
            <p className="text-muted-foreground text-center mb-4">
              Tạo hồ sơ công ty đầu tiên để bắt đầu đăng tin tuyển dụng
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo công ty mới
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo công ty mới
            </Button>
          </div>
          <div className="grid gap-6">
            {companies?.map((company) => (
              <Card
                key={company.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      <Badge
                        variant={company.is_verified ? "default" : "secondary"}
                      >
                        {company.is_verified ? "Đã xác minh" : "Chưa xác minh"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {company.description || "Chưa có mô tả"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCompany(company)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {company.industry && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{company.industry.name}</span>
                      </div>
                    )}

                    {company.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{company.location.name}</span>
                      </div>
                    )}

                    {company.size && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {company.size === "startup" && "Startup"}
                          {company.size === "small" && "Nhỏ (1-50 nhân viên)"}
                          {company.size === "medium" &&
                            "Vừa (51-200 nhân viên)"}
                          {company.size === "large" &&
                            "Lớn (201-1000 nhân viên)"}
                          {company.size === "enterprise" &&
                            "Doanh nghiệp (1000+ nhân viên)"}
                        </span>
                      </div>
                    )}

                    {company.website_url && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}

                    {company.founded_year && (
                      <div className="text-muted-foreground">
                        Thành lập: {company.founded_year}
                      </div>
                    )}

                    {company.employee_count && (
                      <div className="text-muted-foreground">
                        {company.employee_count} nhân viên
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CompanyDialog
        isOpen={isCreateDialogOpen}
        onClose={handleDialogClose}
        mode="create"
      />

      <CompanyDialog
        isOpen={isEditDialogOpen}
        onClose={handleDialogClose}
        mode="edit"
        company={selectedCompany}
      />
    </div>
  );
}
