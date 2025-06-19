"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, FilterX } from "lucide-react";
import { useIndustries } from "@/hooks/industries";
import { useLocations } from "@/hooks/locations";

interface JobFiltersProps {
  searchParams: {
    search?: string;
    industry?: string;
    location?: string;
    employment_type?: string;
    experience_level?: string;
    salary_min?: string;
    salary_max?: string;
    is_remote?: string;
    page?: string;
  };
}

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Toàn thời gian" },
  { value: "part_time", label: "Bán thời gian" },
  { value: "contract", label: "Hợp đồng" },
  { value: "internship", label: "Thực tập" },
  { value: "freelance", label: "Freelance" },
];

const EXPERIENCE_LEVELS = [
  { value: "entry_level", label: "Mới ra trường" },
  { value: "mid_level", label: "Trung cấp" },
  { value: "senior_level", label: "Cao cấp" },
  { value: "executive", label: "Quản lý" },
];

const SALARY_RANGES = [
  { min: 0, max: 10000000, label: "Dưới 10 triệu" },
  { min: 10000000, max: 20000000, label: "10 - 20 triệu" },
  { min: 20000000, max: 30000000, label: "20 - 30 triệu" },
  { min: 30000000, max: 50000000, label: "30 - 50 triệu" },
  { min: 50000000, max: 0, label: "Trên 50 triệu" },
];

export function JobFilters({ searchParams }: JobFiltersProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const { data: industries, isLoading: industriesLoading } = useIndustries();
  const { data: locations, isLoading: locationsLoading } = useLocations();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(urlSearchParams);

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset page when filter changes
    params.delete("page");

    router.push(`/jobs?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(urlSearchParams);

    // Keep only search query
    const search = params.get("search");
    // Clear all params by creating new URLSearchParams
    const newParams = new URLSearchParams();
    if (search) {
      newParams.set("search", search);
    }

    router.push(`/jobs?${newParams.toString()}`);
  };

  const hasActiveFilters = Object.entries(searchParams).some(
    ([key, value]) => key !== "search" && key !== "page" && value
  );

  const getActiveFilters = () => {
    const filters: Array<{ key: string; value: string; label: string }> = [];

    if (searchParams.industry) {
      const industry = industries?.find(
        (i) => i.id.toString() === searchParams.industry
      );
      if (industry) {
        filters.push({
          key: "industry",
          value: searchParams.industry,
          label: industry.name,
        });
      }
    }

    if (searchParams.location) {
      const location = locations?.find(
        (l) => l.id.toString() === searchParams.location
      );
      if (location) {
        filters.push({
          key: "location",
          value: searchParams.location,
          label: location.name,
        });
      }
    }

    if (searchParams.employment_type) {
      const empType = EMPLOYMENT_TYPES.find(
        (t) => t.value === searchParams.employment_type
      );
      if (empType) {
        filters.push({
          key: "employment_type",
          value: searchParams.employment_type,
          label: empType.label,
        });
      }
    }

    if (searchParams.experience_level) {
      const expLevel = EXPERIENCE_LEVELS.find(
        (l) => l.value === searchParams.experience_level
      );
      if (expLevel) {
        filters.push({
          key: "experience_level",
          value: searchParams.experience_level,
          label: expLevel.label,
        });
      }
    }

    if (searchParams.salary_min || searchParams.salary_max) {
      const min = parseInt(searchParams.salary_min || "0");
      const max = parseInt(searchParams.salary_max || "0");
      const range = SALARY_RANGES.find(
        (r) => r.min === min && (r.max === max || (r.max === 0 && max === 0))
      );
      if (range) {
        filters.push({
          key: "salary",
          value: `${min}-${max}`,
          label: range.label,
        });
      }
    }

    if (searchParams.is_remote === "true") {
      filters.push({
        key: "is_remote",
        value: "true",
        label: "Làm việc từ xa",
      });
    }

    return filters;
  };

  const removeFilter = (key: string) => {
    if (key === "salary") {
      updateFilter("salary_min", null);
      updateFilter("salary_max", null);
    } else {
      updateFilter(key, null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bộ lọc</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <FilterX className="h-4 w-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Filters */}
        {hasActiveFilters && (
          <>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Đang áp dụng
              </Label>
              <div className="flex flex-wrap gap-2">
                {getActiveFilters().map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="text-xs"
                  >
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeFilter(filter.key)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Industry Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Ngành nghề</Label>
          <Select
            value={searchParams.industry || "all"}
            onValueChange={(value) => updateFilter("industry", value)}
            disabled={industriesLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn ngành nghề" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ngành nghề</SelectItem>
              {industries?.map((industry) => (
                <SelectItem key={industry.id} value={industry.id.toString()}>
                  {industry.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Địa điểm</Label>
          <Select
            value={searchParams.location || "all"}
            onValueChange={(value) => updateFilter("location", value)}
            disabled={locationsLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn địa điểm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả địa điểm</SelectItem>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employment Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Loại hình</Label>
          <Select
            value={searchParams.employment_type || "all"}
            onValueChange={(value) => updateFilter("employment_type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn loại hình" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại hình</SelectItem>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Experience Level Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Kinh nghiệm</Label>
          <Select
            value={searchParams.experience_level || "all"}
            onValueChange={(value) => updateFilter("experience_level", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn cấp độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cấp độ</SelectItem>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Salary Range Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Mức lương</Label>
          <Select
            value={
              searchParams.salary_min || searchParams.salary_max
                ? `${searchParams.salary_min || 0}-${
                    searchParams.salary_max || 0
                  }`
                : "all"
            }
            onValueChange={(value) => {
              if (value === "all") {
                updateFilter("salary_min", null);
                updateFilter("salary_max", null);
              } else {
                const [min, max] = value.split("-");
                updateFilter("salary_min", min === "0" ? null : min);
                updateFilter("salary_max", max === "0" ? null : max);
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn mức lương" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức lương</SelectItem>
              {SALARY_RANGES.map((range) => (
                <SelectItem
                  key={`${range.min}-${range.max}`}
                  value={`${range.min}-${range.max}`}
                >
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Remote Work Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={searchParams.is_remote === "true"}
            onCheckedChange={(checked) =>
              updateFilter("is_remote", checked ? "true" : null)
            }
          />
          <Label htmlFor="remote" className="text-sm font-medium">
            Làm việc từ xa
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
