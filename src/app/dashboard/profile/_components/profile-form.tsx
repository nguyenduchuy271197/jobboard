"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Profile } from "@/types/custom.types";
import { useUpdateProfile } from "@/hooks/users/use-update-profile";
import { useUploadAvatar } from "@/hooks/users/use-upload-avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  Camera,
  User,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { ERROR_MESSAGES } from "@/constants/error-messages";

const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, ERROR_MESSAGES.USER.INVALID_NAME),
  phone: z
    .string()
    .regex(/^(\+84|0)[0-9]{9,10}$/, ERROR_MESSAGES.USER.INVALID_PHONE)
    .nullable()
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      phone: profile.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const result = await updateProfileMutation.mutateAsync({
        full_name: data.full_name,
        phone: data.phone || null,
      });

      if (result.success) {
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Đã có lỗi xảy ra khi cập nhật hồ sơ");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file hình ảnh");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.error("Vui lòng chọn file để tải lên");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const result = await uploadAvatarMutation.mutateAsync(formData);

      if (result.success) {
        toast.success("Cập nhật avatar thành công!");
        setAvatarDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Đã có lỗi xảy ra khi tải lên avatar");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "job_seeker":
        return <Badge variant="secondary">Ứng viên</Badge>;
      case "employer":
        return <Badge variant="default">Nhà tuyển dụng</Badge>;
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">Chưa xác định</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>Cập nhật thông tin cơ bản của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập họ và tên đầy đủ"
                        disabled={updateProfileMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="Nhập số điện thoại"
                        disabled={updateProfileMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Định dạng: +84xxxxxxxxx hoặc 0xxxxxxxxx
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Cập nhật thông tin
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Avatar and Account Details */}
      <div className="space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Ảnh đại diện
            </CardTitle>
            <CardDescription>Cập nhật ảnh đại diện của bạn</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {profile.full_name?.charAt(0) || profile.email.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Thay đổi avatar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cập nhật avatar</DialogTitle>
                  <DialogDescription>
                    Chọn một hình ảnh mới cho avatar của bạn. File phải có định
                    dạng JPG, PNG và nhỏ hơn 5MB.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    {previewUrl && (
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={previewUrl} />
                        <AvatarFallback>Preview</AvatarFallback>
                      </Avatar>
                    )}

                    <div className="w-full">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                          <div className="text-center">
                            <Upload className="h-8 w-8 mx-auto text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Click để chọn file hoặc kéo thả vào đây
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG tối đa 5MB
                            </p>
                          </div>
                        </div>
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAvatarUpload}
                      disabled={!selectedFile || uploadAvatarMutation.isPending}
                      className="flex-1"
                    >
                      {uploadAvatarMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Cập nhật
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAvatarDialogOpen(false);
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Vai trò</p>
                <div className="mt-1">{getRoleBadge(profile.role)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Ngày tham gia</p>
                <p className="text-sm text-gray-600">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            {profile.updated_at && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Cập nhật lần cuối</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(profile.updated_at)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
