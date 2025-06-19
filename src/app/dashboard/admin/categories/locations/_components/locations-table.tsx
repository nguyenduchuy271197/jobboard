"use client";

import { useState } from "react";
import { Location } from "@/types/custom.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { LocationDialog } from "./location-dialog";
import { useDeleteLocation } from "@/hooks/locations/use-delete-location";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface LocationsTableProps {
  locations: Location[];
}

export function LocationsTable({ locations }: LocationsTableProps) {
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(
    null
  );

  const deleteMutation = useDeleteLocation();

  const handleDelete = async () => {
    if (!deletingLocation) return;

    try {
      const result = await deleteMutation.mutateAsync({
        id: deletingLocation.id,
      });
      if (result.success) {
        toast.success("Xóa địa điểm thành công");
        setDeletingLocation(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa địa điểm");
    }
  };

  if (locations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có địa điểm nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên địa điểm</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {location.slug}
                  </code>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(location.created_at), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingLocation(location)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingLocation(location)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editingLocation && (
        <LocationDialog
          open={!!editingLocation}
          onOpenChange={(open) => !open && setEditingLocation(null)}
          mode="edit"
          location={editingLocation}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingLocation}
        onOpenChange={(open) => !open && setDeletingLocation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa địa điểm &ldquo;{deletingLocation?.name}
              &rdquo;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
