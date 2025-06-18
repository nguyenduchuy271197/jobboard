"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateCompany } from "@/hooks/companies/use-create-company";
import { useUpdateCompany } from "@/hooks/companies/use-update-company";
import { useIndustries } from "@/hooks/industries/use-industries";
import { useLocations } from "@/hooks/locations/use-locations";
import { Company, CompanySize } from "@/types/custom.types";
import { toast } from "sonner";

const companySchema = z.object({
  name: z
    .string()
    .min(1, "Tên công ty là bắt buộc")
    .max(100, "Tên công ty quá dài"),
  description: z.string().optional(),
  website_url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  industry_id: z.number().optional(),
  location_id: z.number().optional(),
  size: z
    .enum(["startup", "small", "medium", "large", "enterprise"])
    .optional(),
  address: z.string().optional(),
  founded_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  employee_count: z.number().min(0).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  company?: Company | null;
}

const companySizeOptions: { value: CompanySize; label: string }[] = [
  { value: "startup", label: "Startup" },
  { value: "small", label: "Nhỏ (1-50 nhân viên)" },
  { value: "medium", label: "Vừa (51-200 nhân viên)" },
  { value: "large", label: "Lớn (201-1000 nhân viên)" },
  { value: "enterprise", label: "Doanh nghiệp (1000+ nhân viên)" },
];

export default function CompanyDialog({
  isOpen,
  onClose,
  mode,
  company,
}: CompanyDialogProps) {
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const { data: industries } = useIndustries();
  const { data: locations } = useLocations();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      description: "",
      website_url: "",
      industry_id: undefined,
      location_id: undefined,
      size: undefined,
      address: "",
      founded_year: undefined,
      employee_count: undefined,
    },
  });

  // Reset form when dialog opens/closes or company changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && company) {
        form.reset({
          name: company.name,
          description: company.description || "",
          website_url: company.website_url || "",
          industry_id: company.industry_id || undefined,
          location_id: company.location_id || undefined,
          size: company.size || undefined,
          address: company.address || "",
          founded_year: company.founded_year || undefined,
          employee_count: company.employee_count || undefined,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          website_url: "",
          industry_id: undefined,
          location_id: undefined,
          size: undefined,
          address: "",
          founded_year: undefined,
          employee_count: undefined,
        });
      }
    }
  }, [isOpen, mode, company, form]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (mode === "create") {
        await createCompanyMutation.mutateAsync(data);
        toast.success("Tạo công ty thành công!");
        onClose();
      } else if (mode === "edit" && company) {
        await updateCompanyMutation.mutateAsync({
          id: company.id,
          ...data,
        });
        toast.success("Cập nhật công ty thành công!");
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Đã có lỗi xảy ra, vui lòng thử lại";
      toast.error(errorMessage);
    }
  };

  const isLoading =
    createCompanyMutation.isPending || updateCompanyMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tạo công ty mới" : "Chỉnh sửa công ty"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Nhập thông tin cơ bản để tạo hồ sơ công ty mới"
              : "Cập nhật thông tin công ty của bạn"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tên công ty *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên công ty"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mô tả công ty</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mô tả ngắn về công ty..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngành nghề</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn ngành nghề" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries?.map((industry) => (
                          <SelectItem
                            key={industry.id}
                            value={industry.id.toString()}
                          >
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa điểm</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString() || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn địa điểm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations?.map((location) => (
                          <SelectItem
                            key={location.id}
                            value={location.id.toString()}
                          >
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quy mô công ty</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn quy mô" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companySizeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Địa chỉ cụ thể"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="founded_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Năm thành lập</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2020"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employee_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng nhân viên</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Đang xử lý..."
                  : mode === "create"
                  ? "Tạo công ty"
                  : "Cập nhật"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
