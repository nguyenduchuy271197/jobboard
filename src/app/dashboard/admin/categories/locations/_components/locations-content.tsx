"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { LocationsTable } from "./locations-table";
import { LocationDialog } from "./location-dialog";
import { useLocations } from "@/hooks/locations/use-locations";
import { Skeleton } from "@/components/ui/skeleton";

export function LocationsContent() {
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    data: locations,
    isLoading,
    error,
  } = useLocations({
    search: search || undefined,
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu địa điểm</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm địa điểm
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              locations?.length || 0
            )}
          </div>
          <div className="text-sm text-gray-600">Tổng số địa điểm</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">
            {isLoading ? <Skeleton className="h-8 w-16" /> : "63"}
          </div>
          <div className="text-sm text-gray-600">Tỉnh/Thành phố</div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <LocationsTable locations={locations || []} />
      )}

      {/* Create Dialog */}
      <LocationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        mode="create"
      />
    </div>
  );
}
