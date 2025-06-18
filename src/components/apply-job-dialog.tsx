"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateApplication } from "@/hooks/job-applications";
import { useCurrentJobSeekerProfile } from "@/hooks/job-seeker-profiles";
import { FileText, Briefcase, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { DatabaseJob } from "@/types/custom.types";
import { getExperienceLevelLabel, formatSalary } from "@/constants/labels";

const applyJobSchema = z.object({
  cover_letter: z
    .string()
    .refine(
      (val) => val === "" || val.length >= 50,
      "Thư xin việc phải có ít nhất 50 ký tự"
    )
    .refine(
      (val) => val.length <= 2000,
      "Thư xin việc không được quá 2000 ký tự"
    )
    .optional(),
});

type ApplyJobFormData = z.infer<typeof applyJobSchema>;

interface ApplyJobDialogProps {
  job: DatabaseJob;
  children: React.ReactNode;
}

export function ApplyJobDialog({ job, children }: ApplyJobDialogProps) {
  const [open, setOpen] = useState(false);
  const createApplicationMutation = useCreateApplication();
  const { data: profile, isLoading: profileLoading } =
    useCurrentJobSeekerProfile();

  const form = useForm<ApplyJobFormData>({
    resolver: zodResolver(applyJobSchema),
    defaultValues: {
      cover_letter: "",
    },
  });

  const handleSubmit = async (data: ApplyJobFormData) => {
    try {
      await createApplicationMutation.mutateAsync({
        job_id: job.id,
        cover_letter: data.cover_letter,
      });

      toast.success("Đã ứng tuyển thành công!", {
        description: "Hồ sơ của bạn đã được gửi đến nhà tuyển dụng.",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi ứng tuyển"
      );
    }
  };

  // Show profile creation prompt if no profile
  if (!profileLoading && !profile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Tạo hồ sơ ứng viên
            </DialogTitle>
            <DialogDescription>
              Bạn cần tạo hồ sơ ứng viên trước khi có thể ứng tuyển công việc.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Hồ sơ ứng viên giúp nhà tuyển dụng hiểu rõ hơn về kinh nghiệm và
                kỹ năng của bạn.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href="/dashboard/profile">Tạo hồ sơ ứng viên</Link>
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Để sau
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Ứng tuyển: {job.title}
          </DialogTitle>
          <DialogDescription>
            Gửi hồ sơ ứng tuyển của bạn đến {job.company?.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Job Information */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Thông tin công việc
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Vị trí:</span>
                  <span className="font-medium">{job.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Công ty:</span>
                  <span className="font-medium">{job.company?.name}</span>
                </div>
                {job.location && (
                  <div className="flex justify-between">
                    <span>Địa điểm:</span>
                    <span className="font-medium">{job.location.name}</span>
                  </div>
                )}
                {(job.salary_min || job.salary_max) && (
                  <div className="flex justify-between">
                    <span>Mức lương:</span>
                    <span className="font-medium">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            {profile && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Hồ sơ ứng viên của bạn
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {profile.headline && (
                    <div className="flex justify-between">
                      <span>Tiêu đề:</span>
                      <span className="font-medium">{profile.headline}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Kinh nghiệm:</span>
                    <span className="font-medium">
                      {getExperienceLevelLabel(profile.experience_level || "")}
                    </span>
                  </div>
                  {profile.skills && profile.skills.length > 0 && (
                    <div>
                      <span>Kỹ năng: </span>
                      <span className="font-medium">
                        {profile.skills.slice(0, 3).join(", ")}
                      </span>
                      {profile.skills.length > 3 && (
                        <span>
                          {" "}
                          và {profile.skills.length - 3} kỹ năng khác
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  asChild
                  className="p-0 h-auto mt-2 text-blue-600"
                >
                  <Link href="/dashboard/profile" target="_blank">
                    Chỉnh sửa hồ sơ
                  </Link>
                </Button>
              </div>
            )}

            {/* Cover Letter */}
            <FormField
              control={form.control}
              name="cover_letter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Thư xin việc
                    <span className="text-sm text-gray-500 ml-1">
                      (Tùy chọn)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này... (Nếu điền thì cần ít nhất 50 ký tự)"
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-gray-500">
                    <FormMessage />
                    <span>
                      {field.value?.length || 0}/2000
                      {field.value &&
                        field.value.length > 0 &&
                        field.value.length < 50 && (
                          <span className="text-orange-500 ml-2">
                            (Cần thêm {50 - field.value.length} ký tự)
                          </span>
                        )}
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createApplicationMutation.isPending}
                className="flex-1"
              >
                {createApplicationMutation.isPending
                  ? "Đang gửi..."
                  : "Gửi hồ sơ ứng tuyển"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createApplicationMutation.isPending}
              >
                Hủy
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
