"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateJob } from "@/hooks/jobs/use-create-job";
import { useUpdateJob } from "@/hooks/jobs/use-update-job";
import { useIndustries } from "@/hooks/industries/use-industries";
import { useLocations } from "@/hooks/locations/use-locations";
import { Job, Company } from "@/types/custom.types";
import {
  EMPLOYMENT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/constants/labels";
import { toast } from "sonner";

const jobFormSchema = z
  .object({
    company_id: z.number().positive("Vui lòng chọn công ty"),
    title: z
      .string()
      .min(1, "Tiêu đề công việc không được để trống")
      .max(255, "Tiêu đề không được quá 255 ký tự"),
    description: z.string().min(10, "Mô tả công việc phải có ít nhất 10 ký tự"),
    requirements: z
      .string()
      .min(10, "Yêu cầu công việc phải có ít nhất 10 ký tự"),
    industry_id: z.number().positive("Vui lòng chọn ngành nghề").optional(),
    location_id: z.number().positive("Vui lòng chọn địa điểm").optional(),
    employment_type: z.enum([
      "full_time",
      "part_time",
      "contract",
      "freelance",
      "internship",
    ]),
    experience_level: z.enum([
      "entry_level",
      "mid_level",
      "senior_level",
      "executive",
    ]),
    salary_min: z.number().min(0, "Lương tối thiểu không hợp lệ").optional(),
    salary_max: z.number().min(0, "Lương tối đa không hợp lệ").optional(),
    is_remote: z.boolean().optional(),
    application_deadline: z.string().optional(),
    status: z.enum(["draft", "pending_approval", "published"]).optional(),
  })
  .refine(
    (data) => {
      if (data.salary_min && data.salary_max) {
        return data.salary_min <= data.salary_max;
      }
      return true;
    },
    {
      message: "Lương tối thiểu không được lớn hơn lương tối đa",
      path: ["salary_max"],
    }
  );

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: Job | null;
  companies: Pick<Company, "id" | "name">[];
  defaultCompanyId?: number | null;
}

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  companies,
  defaultCompanyId,
}: JobFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!job;

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      company_id: defaultCompanyId || companies[0]?.id || 0,
      title: "",
      description: "",
      requirements: "",
      employment_type: "full_time",
      experience_level: "mid_level",
      is_remote: false,
      status: "draft",
    },
  });

  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const { data: industries } = useIndustries({ is_active: true });
  const { data: locations } = useLocations();

  // Reset form when dialog opens/closes or job changes
  useEffect(() => {
    if (open && job) {
      form.reset({
        company_id: job.company_id,
        title: job.title,
        description: job.description,
        requirements: job.requirements || "",
        industry_id: job.industry_id || undefined,
        location_id: job.location_id || undefined,
        employment_type: job.employment_type,
        experience_level: job.experience_level || "mid_level",
        salary_min: job.salary_min || undefined,
        salary_max: job.salary_max || undefined,
        is_remote: job.is_remote,
        application_deadline: job.application_deadline
          ? new Date(job.application_deadline).toISOString().slice(0, 16)
          : "",
        status: job.status as "draft" | "pending_approval" | "published",
      });
    } else if (open && !job) {
      form.reset({
        company_id: defaultCompanyId || companies[0]?.id || 0,
        title: "",
        description: "",
        requirements: "",
        employment_type: "full_time",
        experience_level: "mid_level",
        is_remote: false,
        status: "draft",
      });
    }
  }, [open, job, defaultCompanyId, companies, form]);

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        industry_id: data.industry_id || undefined,
        location_id: data.location_id || undefined,
        salary_min: data.salary_min || undefined,
        salary_max: data.salary_max || undefined,
        application_deadline: data.application_deadline
          ? new Date(data.application_deadline).toISOString()
          : undefined,
      };

      if (isEditing && job) {
        await updateJobMutation.mutateAsync({
          id: job.id,
          ...payload,
        });
        toast.success("Cập nhật tin tuyển dụng thành công");
      } else {
        await createJobMutation.mutateAsync(payload);
        toast.success("Tạo tin tuyển dụng thành công");
      }

      onOpenChange(false);
    } catch {
      toast.error(
        isEditing
          ? "Có lỗi xảy ra khi cập nhật tin tuyển dụng"
          : "Có lỗi xảy ra khi tạo tin tuyển dụng"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Company Selection */}
            {companies.length > 1 && (
              <FormField
                control={form.control}
                name="company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Công ty</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn công ty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem
                            key={company.id}
                            value={company.id.toString()}
                          >
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Tiêu đề công việc</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Senior Frontend Developer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Employment Type */}
              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hình công việc</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">
                          {EMPLOYMENT_TYPE_LABELS.full_time}
                        </SelectItem>
                        <SelectItem value="part_time">
                          {EMPLOYMENT_TYPE_LABELS.part_time}
                        </SelectItem>
                        <SelectItem value="contract">
                          {EMPLOYMENT_TYPE_LABELS.contract}
                        </SelectItem>
                        <SelectItem value="freelance">
                          {EMPLOYMENT_TYPE_LABELS.freelance}
                        </SelectItem>
                        <SelectItem value="internship">
                          {EMPLOYMENT_TYPE_LABELS.internship}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience Level */}
              <FormField
                control={form.control}
                name="experience_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cấp độ kinh nghiệm</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry_level">
                          {EXPERIENCE_LEVEL_LABELS.entry_level}
                        </SelectItem>
                        <SelectItem value="mid_level">
                          {EXPERIENCE_LEVEL_LABELS.mid_level}
                        </SelectItem>
                        <SelectItem value="senior_level">
                          {EXPERIENCE_LEVEL_LABELS.senior_level}
                        </SelectItem>
                        <SelectItem value="executive">
                          {EXPERIENCE_LEVEL_LABELS.executive}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Industry */}
              <FormField
                control={form.control}
                name="industry_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngành nghề</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value ? Number(value) : undefined)
                      }
                      value={field.value?.toString() || ""}
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

              {/* Location */}
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa điểm</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value ? Number(value) : undefined)
                      }
                      value={field.value?.toString() || ""}
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

              {/* Salary Range */}
              <FormField
                control={form.control}
                name="salary_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lương tối thiểu (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10000000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lương tối đa (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20000000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Application Deadline */}
              <FormField
                control={form.control}
                name="application_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn ứng tuyển</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Bản nháp</SelectItem>
                        <SelectItem value="pending_approval">
                          Gửi duyệt
                        </SelectItem>
                        <SelectItem value="published">Xuất bản ngay</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Remote Work */}
            <FormField
              control={form.control}
              name="is_remote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cho phép làm việc từ xa</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Job Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả công việc</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chi tiết về công việc, trách nhiệm và yêu cầu..."
                      rows={4}
                      className="min-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Requirements */}
            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yêu cầu công việc</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Kỹ năng, kinh nghiệm và các yêu cầu cụ thể..."
                      rows={4}
                      className="min-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Đang xử lý..."
                  : isEditing
                  ? "Cập nhật"
                  : "Tạo tin"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
