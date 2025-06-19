"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Location } from "@/types/custom.types";
import { LocationForm } from "./location-form";

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  location?: Location;
}

export function LocationDialog({
  open,
  onOpenChange,
  mode,
  location,
}: LocationDialogProps) {
  const title = mode === "create" ? "Thêm địa điểm mới" : "Chỉnh sửa địa điểm";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <LocationForm
          mode={mode}
          location={location}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
