"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, UserCheck, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/auth/use-register";
// import { UserRole } from "@/types/custom.types";

const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ").min(1, "Email là bắt buộc"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(255, "Họ tên không được quá 255 ký tự"),
  role: z.enum(["job_seeker", "employer"] as const),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const registerMutation = useRegister();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "job_seeker",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync(data);

      if (result.success) {
        toast.success(
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."
        );
        router.push("/auth/login");
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi đăng ký");
      console.error("Register error:", error);
    }
  };

  const selectedRole = form.watch("role");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bạn muốn đăng ký tài khoản gì?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value="job_seeker" id="job_seeker" />
                    <Label
                      htmlFor="job_seeker"
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <UserCheck className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Ứng viên tìm việc</div>
                        <div className="text-sm text-gray-500">
                          Tôi muốn tìm việc làm
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                    <RadioGroupItem value="employer" id="employer" />
                    <Label
                      htmlFor="employer"
                      className="flex items-center space-x-2 cursor-pointer flex-1"
                    >
                      <Building className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Nhà tuyển dụng</div>
                        <div className="text-sm text-gray-500">
                          Tôi muốn tuyển dụng nhân tài
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập họ và tên của bạn"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="example@company.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    autoComplete="new-password"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            `Tạo tài khoản ${
              selectedRole === "job_seeker" ? "ứng viên" : "nhà tuyển dụng"
            }`
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-600">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a
              href="/privacy"
              className="text-indigo-600 hover:text-indigo-500"
            >
              Chính sách bảo mật
            </a>
          </p>
        </div>
      </form>
    </Form>
  );
}
