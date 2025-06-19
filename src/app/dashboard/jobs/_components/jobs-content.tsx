"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUserCompanies } from "@/hooks/companies/use-user-companies";
import { JobsTable } from "./jobs-table";
import { JobFormDialog } from "./job-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export function JobsContent() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  const {
    data: companies,
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useUserCompanies();

  if (isLoadingCompanies) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (companiesError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Có lỗi xảy ra khi tải thông tin công ty. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chưa có công ty</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Bạn cần tạo hồ sơ công ty trước khi có thể đăng tin tuyển dụng.
          </p>
          <Button asChild>
            <a href="/dashboard/company">Tạo hồ sơ công ty</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Auto select first company if only one exists
  const defaultCompanyId =
    companies.length === 1 ? companies[0].id : selectedCompanyId;

  const handleCreateJob = () => {
    if (companies.length === 1) {
      setSelectedCompanyId(companies[0].id);
    }
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Quản lý tin tuyển dụng</h2>
          <p className="text-sm text-muted-foreground">
            Tạo và quản lý các tin tuyển dụng của công ty
          </p>
        </div>
        <Button onClick={handleCreateJob}>
          <Plus className="mr-2 h-4 w-4" />
          Đăng tin mới
        </Button>
      </div>

      {companies.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chọn công ty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCompanyId === company.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCompanyId(company.id)}
                >
                  <div className="flex items-center space-x-3">
                    {company.logo_url && (
                      <Image
                        src={company.logo_url}
                        alt={company.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{company.name}</h3>
                      {company.is_verified && (
                        <span className="text-xs text-green-600">
                          ✓ Đã xác minh
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {defaultCompanyId && <JobsTable companyId={defaultCompanyId} />}

      <JobFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        companies={companies}
        defaultCompanyId={defaultCompanyId}
      />
    </div>
  );
}
