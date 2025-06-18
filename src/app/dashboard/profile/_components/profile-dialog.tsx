"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateJobSeekerProfile,
  useUpdateJobSeekerProfile,
} from "@/hooks/job-seeker-profiles";
import { useLocations } from "@/hooks/locations";
import { JobSeekerProfile } from "@/types/custom.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, X, Plus } from "lucide-react";
import { toast } from "sonner";

const profileSchema = z
  .object({
    headline: z
      .string()
      .min(1, "Chức danh không được để trống")
      .max(255, "Chức danh không được quá 255 ký tự"),
    summary: z
      .string()
      .min(1, "Mô tả bản thân không được để trống")
      .max(2000, "Mô tả không được quá 2000 ký tự"),
    skills: z.array(z.string()).min(1, "Phải có ít nhất một kỹ năng"),
    experience_level: z.enum([
      "entry_level",
      "mid_level",
      "senior_level",
      "executive",
    ]),
    preferred_location_id: z.number().optional(),
    preferred_salary_min: z
      .number()
      .min(0, "Mức lương không hợp lệ")
      .optional(),
    preferred_salary_max: z
      .number()
      .min(0, "Mức lương không hợp lệ")
      .optional(),
    is_looking_for_job: z.boolean(),
    portfolio_url: z
      .string()
      .url("URL không hợp lệ")
      .optional()
      .or(z.literal("")),
    linkedin_url: z
      .string()
      .url("URL không hợp lệ")
      .optional()
      .or(z.literal("")),
    github_url: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.preferred_salary_min && data.preferred_salary_max) {
        return data.preferred_salary_min <= data.preferred_salary_max;
      }
      return true;
    },
    {
      message: "Mức lương tối thiểu không được lớn hơn mức lương tối đa",
      path: ["preferred_salary_max"],
    }
  );

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: JobSeekerProfile | null;
  onSuccess: () => void;
}

export function ProfileDialog({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: ProfileDialogProps) {
  const [newSkill, setNewSkill] = useState("");
  const isEditing = !!profile;

  const createMutation = useCreateJobSeekerProfile();
  const updateMutation = useUpdateJobSeekerProfile();
  const { data: locations = [] } = useLocations({ limit: 100 });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: "",
      summary: "",
      skills: [],
      experience_level: "entry_level",
      preferred_location_id: undefined,
      preferred_salary_min: undefined,
      preferred_salary_max: undefined,
      is_looking_for_job: true,
      portfolio_url: "",
      linkedin_url: "",
      github_url: "",
    },
  });

  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        headline: profile.headline || "",
        summary: profile.summary || "",
        skills: profile.skills || [],
        experience_level: profile.experience_level || "entry_level",
        preferred_location_id: profile.preferred_location_id || undefined,
        preferred_salary_min: profile.preferred_salary_min || undefined,
        preferred_salary_max: profile.preferred_salary_max || undefined,
        is_looking_for_job: profile.is_looking_for_job,
        portfolio_url: profile.portfolio_url || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: profile.github_url || "",
      });
    } else {
      form.reset({
        headline: "",
        summary: "",
        skills: [],
        experience_level: "entry_level",
        preferred_location_id: undefined,
        preferred_salary_min: undefined,
        preferred_salary_max: undefined,
        is_looking_for_job: true,
        portfolio_url: "",
        linkedin_url: "",
        github_url: "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const submissionData = {
        ...data,
        preferred_location_id: data.preferred_location_id || undefined,
        preferred_salary_min: data.preferred_salary_min || undefined,
        preferred_salary_max: data.preferred_salary_max || undefined,
        portfolio_url: data.portfolio_url || undefined,
        linkedin_url: data.linkedin_url || undefined,
        github_url: data.github_url || undefined,
      };

      if (isEditing) {
        await updateMutation.mutateAsync(submissionData);
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        await createMutation.mutateAsync(submissionData);
        toast.success("Tạo hồ sơ thành công!");
      }

      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra");
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = form.getValues("skills");
      if (!currentSkills.includes(newSkill.trim())) {
        form.setValue("skills", [...currentSkills, newSkill.trim()]);
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const experienceLevels = [
    { value: "entry_level", label: "Mới bắt đầu" },
    { value: "mid_level", label: "Trung cấp" },
    { value: "senior_level", label: "Cao cấp" },
    { value: "executive", label: "Điều hành" },
  ];

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa hồ sơ" : "Tạo hồ sơ ứng viên"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Cập nhật thông tin hồ sơ ứng viên của bạn"
              : "Tạo hồ sơ để bắt đầu tìm kiếm việc làm"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Headline */}
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức danh *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Frontend Developer, Marketing Manager"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả bản thân *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Giới thiệu về kinh nghiệm, kỹ năng và mục tiêu nghề nghiệp..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề
                    nghiệp
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kỹ năng *</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập kỹ năng (React, JavaScript, Marketing...)"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addSkill}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
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
                  <FormLabel>Cấp độ kinh nghiệm *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cấp độ kinh nghiệm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Location */}
            <FormField
              control={form.control}
              name="preferred_location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa điểm ưu tiên</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value && value !== "0" ? parseInt(value) : undefined
                      )
                    }
                    value={field.value?.toString() || "0"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn địa điểm ưu tiên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">Không chọn</SelectItem>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Salary Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preferred_salary_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức lương tối thiểu (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 15000000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
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
                name="preferred_salary_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mức lương tối đa (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ví dụ: 25000000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Seeking Status */}
            <FormField
              control={form.control}
              name="is_looking_for_job"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Đang tìm việc</FormLabel>
                    <FormDescription>
                      Cho phép nhà tuyển dụng liên hệ với bạn
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* URLs */}
            <div className="space-y-4">
              <h4 className="font-medium">Liên kết (không bắt buộc)</h4>

              <FormField
                control={form.control}
                name="portfolio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://myportfolio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="github_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Cập nhật" : "Tạo hồ sơ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
