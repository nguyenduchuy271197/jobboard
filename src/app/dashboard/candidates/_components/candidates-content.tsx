"use client";

import { useState } from "react";
import { useUserCompanies } from "@/hooks/companies/use-user-companies";
import { useCompanyApplications } from "@/hooks/job-applications/use-company-applications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import CandidatesTable from "./candidates-table";
import { Building, Users } from "lucide-react";

export default function CandidatesContent() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  // Lấy danh sách công ty của user
  const {
    data: companies,
    isLoading: isLoadingCompanies,
    error: companiesError,
  } = useUserCompanies();

  // Lấy danh sách ứng viên theo công ty được chọn
  const {
    data: applications,
    isLoading: isLoadingApplications,
    error: applicationsError,
  } = useCompanyApplications(selectedCompanyId || 0);

  // Auto select first company if only one company
  if (companies && companies.length === 1 && !selectedCompanyId) {
    setSelectedCompanyId(companies[0].id);
  }

  if (isLoadingCompanies) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
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
          Đã có lỗi xảy ra khi tải danh sách công ty: {companiesError.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!companies || companies.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-gray-400" />
          </div>
          <CardTitle>Chưa có công ty</CardTitle>
          <CardDescription>
            Bạn cần tạo hồ sơ công ty trước khi có thể xem ứng viên
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Chọn công ty
          </CardTitle>
          <CardDescription>
            Chọn công ty để xem danh sách ứng viên đã ứng tuyển
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedCompanyId?.toString() || ""}
            onValueChange={(value) => setSelectedCompanyId(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn công ty..." />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {company.name}
                    {company.is_verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        Đã xác minh
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Applications Table */}
      {selectedCompanyId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ứng viên - {selectedCompany?.name}
            </CardTitle>
            <CardDescription>
              Danh sách ứng viên đã ứng tuyển vào các vị trí của công ty
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingApplications ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : applicationsError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Đã có lỗi xảy ra khi tải danh sách ứng viên:{" "}
                  {applicationsError.message}
                </AlertDescription>
              </Alert>
            ) : !applications || applications.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chưa có ứng viên
                </h3>
                <p className="text-gray-600">
                  Chưa có ứng viên nào ứng tuyển vào các vị trí của công ty này
                </p>
              </div>
            ) : (
              <CandidatesTable applications={applications} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
