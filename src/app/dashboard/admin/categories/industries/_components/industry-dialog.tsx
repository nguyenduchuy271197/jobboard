"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Industry } from "@/types/custom.types";
import { IndustryForm } from "./industry-form";

interface IndustryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  industry?: Industry;
}

export function IndustryDialog({
  open,
  onOpenChange,
  mode,
  industry,
}: IndustryDialogProps) {
  const title =
    mode === "create" ? "Thêm ngành nghề mới" : "Chỉnh sửa ngành nghề";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <IndustryForm
          mode={mode}
          industry={industry}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
