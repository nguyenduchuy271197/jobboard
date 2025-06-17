"use client";

import { useState } from "react";
import { Search, MapPin, Building2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIndustries } from "@/hooks/industries";
import { useLocations } from "@/hooks/locations";
import { EmploymentType, ExperienceLevel } from "@/types/custom.types";

interface JobsSearchProps {
  onFiltersChange?: (filters: JobSearchFilters) => void;
}

export interface JobSearchFilters {
  search?: string;
  industry_id?: number;
  location_id?: number;
  employment_type?: EmploymentType;
  experience_level?: ExperienceLevel;
  is_remote?: boolean;
  salary_min?: number;
}

type JobSearchFilterValue =
  | string
  | number
  | EmploymentType
  | ExperienceLevel
  | boolean
  | undefined;

export function JobsSearch({ onFiltersChange }: JobsSearchProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<JobSearchFilters>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: industries = [] } = useIndustries();
  const { data: locations = [] } = useLocations();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, search: search.trim() || undefined };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleFilterChange = (
    key: keyof JobSearchFilters,
    value: JobSearchFilterValue
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    setSearch("");
    setFilters({});
    onFiltersChange?.({});
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined
  ).length;

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Main Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm công việc theo từ khóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Tìm kiếm</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </form>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngành nghề</label>
              <Select
                value={filters.industry_id?.toString() || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "industry_id",
                    value ? parseInt(value) : undefined
                  )
                }
              >
                <SelectTrigger>
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Chọn ngành" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả ngành</SelectItem>
                  {industries.map((industry) => (
                    <SelectItem
                      key={industry.id}
                      value={industry.id.toString()}
                    >
                      {industry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Địa điểm</label>
              <Select
                value={filters.location_id?.toString() || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "location_id",
                    value ? parseInt(value) : undefined
                  )
                }
              >
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Chọn địa điểm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả địa điểm</SelectItem>
                  {locations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại hình</label>
              <Select
                value={filters.employment_type || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "employment_type",
                    (value as EmploymentType) || undefined
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Loại hình" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="full_time">Toàn thời gian</SelectItem>
                  <SelectItem value="part_time">Bán thời gian</SelectItem>
                  <SelectItem value="contract">Hợp đồng</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Thực tập</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kinh nghiệm</label>
              <Select
                value={filters.experience_level || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "experience_level",
                    (value as ExperienceLevel) || undefined
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  <SelectItem value="entry_level">Mới bắt đầu</SelectItem>
                  <SelectItem value="mid_level">Trung cấp</SelectItem>
                  <SelectItem value="senior_level">Cao cấp</SelectItem>
                  <SelectItem value="executive">Điều hành</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
