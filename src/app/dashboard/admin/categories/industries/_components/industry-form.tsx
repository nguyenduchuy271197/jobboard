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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Industry } from "@/types/custom.types";
import { useCreateIndustry } from "@/hooks/industries/use-create-industry";
import { useUpdateIndustry } from "@/hooks/industries/use-update-industry";
import { toast } from "sonner";

const industrySchema = z.object({
  name: z
    .string()
    .min(1, "Tên ngành nghề là bắt buộc")
    .max(255, "Tên ngành nghề không được quá 255 ký tự")
    .trim(),
  description: z
    .string()
    .max(1000, "Mô tả không được quá 1000 ký tự")
    .trim()
    .optional(),
  slug: z
    .string()
    .min(1, "Slug là bắt buộc")
    .max(255, "Slug không được quá 255 ký tự")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
    )
    .trim(),
  is_active: z.boolean(),
});

type IndustryFormData = z.infer<typeof industrySchema>;

interface IndustryFormProps {
  mode: "create" | "edit";
  industry?: Industry;
  onSuccess: () => void;
}

export function IndustryForm({ mode, industry, onSuccess }: IndustryFormProps) {
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(mode === "create");

  const createMutation = useCreateIndustry();
  const updateMutation = useUpdateIndustry();

  const form = useForm<IndustryFormData>({
    resolver: zodResolver(industrySchema),
    defaultValues: {
      name: industry?.name || "",
      description: industry?.description || "",
      slug: industry?.slug || "",
      is_active: industry?.is_active ?? true,
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

  const onSubmit = async (data: IndustryFormData) => {
    try {
      if (mode === "create") {
        const result = await createMutation.mutateAsync(data);
        if (result.success) {
          toast.success("Thêm ngành nghề thành công");
          onSuccess();
        } else {
          toast.error(result.error);
        }
      } else if (industry) {
        const result = await updateMutation.mutateAsync({
          id: industry.id,
          ...data,
        });
        if (result.success) {
          toast.success("Cập nhật ngành nghề thành công");
          onSuccess();
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error("Có lỗi xảy ra khi lưu ngành nghề");
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
              <FormLabel>Tên ngành nghề *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên ngành nghề..."
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
                    placeholder="slug-nganh-nghe"
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả ngành nghề..."
                  rows={3}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Kích hoạt ngành nghề</FormLabel>
                <p className="text-sm text-gray-500">
                  Ngành nghề sẽ hiển thị trong danh sách khi được kích hoạt
                </p>
              </div>
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
              ? "Thêm ngành nghề"
              : "Cập nhật"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
