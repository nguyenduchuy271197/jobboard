"use client";

import { useState } from "react";
import { Industry } from "@/types/custom.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Edit, MoreHorizontal, Power, PowerOff, Trash2 } from "lucide-react";
import { IndustryDialog } from "./industry-dialog";
import { useDeleteIndustry } from "@/hooks/industries/use-delete-industry";
import { useUpdateIndustry } from "@/hooks/industries/use-update-industry";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface IndustriesTableProps {
  industries: Industry[];
}

export function IndustriesTable({ industries }: IndustriesTableProps) {
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null);
  const [deletingIndustry, setDeletingIndustry] = useState<Industry | null>(
    null
  );

  const deleteMutation = useDeleteIndustry();
  const updateMutation = useUpdateIndustry();

  const handleDelete = async () => {
    if (!deletingIndustry) return;

    try {
      const result = await deleteMutation.mutateAsync({
        id: deletingIndustry.id,
      });
      if (result.success) {
        toast.success("Xóa ngành nghề thành công");
        setDeletingIndustry(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa ngành nghề");
    }
  };

  const handleToggleActive = async (industry: Industry) => {
    try {
      const result = await updateMutation.mutateAsync({
        id: industry.id,
        is_active: !industry.is_active,
      });
      if (result.success) {
        toast.success(
          `${industry.is_active ? "Tắt" : "Bật"} ngành nghề thành công`
        );
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật ngành nghề");
    }
  };

  if (industries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Không có ngành nghề nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên ngành nghề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {industries.map((industry) => (
              <TableRow key={industry.id}>
                <TableCell className="font-medium">{industry.name}</TableCell>
                <TableCell>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {industry.slug}
                  </code>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {industry.description || "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={industry.is_active ? "default" : "secondary"}>
                    {industry.is_active ? "Hoạt động" : "Tắt"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(industry.created_at), {
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
                        onClick={() => setEditingIndustry(industry)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(industry)}
                        disabled={updateMutation.isPending}
                      >
                        {industry.is_active ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-2" />
                            Tắt
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-2" />
                            Bật
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingIndustry(industry)}
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
      {editingIndustry && (
        <IndustryDialog
          open={!!editingIndustry}
          onOpenChange={(open) => !open && setEditingIndustry(null)}
          mode="edit"
          industry={editingIndustry}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingIndustry}
        onOpenChange={(open) => !open && setDeletingIndustry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ngành nghề &ldquo;
              {deletingIndustry?.name}&rdquo;? Hành động này không thể hoàn tác.
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
