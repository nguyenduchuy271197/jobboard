"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Location } from "@/types/custom.types";
import { useCreateLocation } from "@/hooks/locations/use-create-location";
import { useUpdateLocation } from "@/hooks/locations/use-update-location";
import { toast } from "sonner";

const locationSchema = z.object({
  name: z
    .string()
    .min(1, "Tên địa điểm là bắt buộc")
    .max(255, "Tên địa điểm không được quá 255 ký tự")
    .trim(),
  slug: z
    .string()
    .min(1, "Slug là bắt buộc")
    .max(255, "Slug không được quá 255 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
    )
    .trim(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  mode: "create" | "edit";
  location?: Location;
  onSuccess: () => void;
}

export function LocationForm({ mode, location, onSuccess }: LocationFormProps) {
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(mode === "create");

  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || "",
      slug: location?.slug || "",
    },
  });

  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  // Auto-generate slug when name changes (only in create mode or when enabled)
  useEffect(() => {
    if (autoGenerateSlug) {
      const subscription = form.watch((value, { name }) => {
        if (name === "name" && value.name) {
          const slug = generateSlug(value.name);
          form.setValue("slug", slug);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [form, autoGenerateSlug]);

  const onSubmit = async (data: LocationFormData) => {
    try {
      if (mode === "create") {
        const result = await createMutation.mutateAsync(data);
        if (result.success) {
          toast.success("Thêm địa điểm thành công");
          onSuccess();
        } else {
          toast.error(result.error);
        }
      } else if (location) {
        const result = await updateMutation.mutateAsync({
          id: location.id,
          ...data,
        });
        if (result.success) {
          toast.success("Cập nhật địa điểm thành công");
          onSuccess();
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu địa điểm");
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên địa điểm *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên địa điểm..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    placeholder="slug-dia-diem"
                    {...field}
                    disabled={isLoading || autoGenerateSlug}
                  />
                  {mode === "create" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="auto-slug"
                        checked={autoGenerateSlug}
                        onCheckedChange={(checked) =>
                          setAutoGenerateSlug(!!checked)
                        }
                      />
                      <label
                        htmlFor="auto-slug"
                        className="text-sm text-gray-600 cursor-pointer"
                      >
                        Tự động tạo slug từ tên
                      </label>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === "create"
                ? "Đang thêm..."
                : "Đang cập nhật..."
              : mode === "create"
              ? "Thêm địa điểm"
              : "Cập nhật"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
