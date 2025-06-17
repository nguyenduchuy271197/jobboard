import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/actions/users/get-profile";
import { getDashboardStats } from "@/actions/dashboard/get-stats";
import {
  JobSeekerDashboardStats,
  EmployerDashboardStats,
  AdminDashboardStats,
} from "@/types/custom.types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [profileResult, statsResult] = await Promise.all([
    getUserProfile(),
    getDashboardStats(),
  ]);

  if (!profileResult.success || !profileResult.data) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Chào mừng trở lại,{" "}
          {profileResult.data.full_name || profileResult.data.email}
        </p>
      </div>

      {/* Dashboard content based on user role */}
      <div className="grid gap-6">
        {profileResult.data.role === "job_seeker" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Hồ sơ ứng tuyển</h3>
              <p className="text-3xl font-bold text-blue-600">
                {statsResult.success && "profile" in statsResult.data
                  ? (statsResult.data as JobSeekerDashboardStats).applications
                      .total_applications
                  : 0}
              </p>
              <p className="text-sm text-gray-500">Tổng số đơn ứng tuyển</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Việc làm mới</h3>
              <p className="text-3xl font-bold text-green-600">
                {statsResult.success && "profile" in statsResult.data
                  ? (statsResult.data as JobSeekerDashboardStats).jobs
                      .recommended_jobs
                  : 0}
              </p>
              <p className="text-sm text-gray-500">Được đề xuất cho bạn</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Tỷ lệ thành công</h3>
              <p className="text-3xl font-bold text-purple-600">
                {statsResult.success && "profile" in statsResult.data
                  ? (statsResult.data as JobSeekerDashboardStats).applications
                      .application_success_rate
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-500">
                Đơn ứng tuyển được chấp nhận
              </p>
            </div>
          </div>
        )}

        {profileResult.data.role === "employer" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Việc làm đang đăng</h3>
              <p className="text-3xl font-bold text-blue-600">
                {statsResult.success && "company" in statsResult.data
                  ? (statsResult.data as EmployerDashboardStats).company
                      .active_jobs
                  : 0}
              </p>
              <p className="text-sm text-gray-500">Đang tuyển dụng</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Ứng viên mới</h3>
              <p className="text-3xl font-bold text-green-600">
                {statsResult.success && "applications" in statsResult.data
                  ? (statsResult.data as EmployerDashboardStats).applications
                      .pending_applications
                  : 0}
              </p>
              <p className="text-sm text-gray-500">Chờ xem xét</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Công ty</h3>
              <p className="text-3xl font-bold text-purple-600">
                {statsResult.success &&
                "company" in statsResult.data &&
                (statsResult.data as EmployerDashboardStats).company.is_verified
                  ? "Đã xác thực"
                  : "Chưa xác thực"}
              </p>
              <p className="text-sm text-gray-500">Trạng thái</p>
            </div>
          </div>
        )}

        {profileResult.data.role === "admin" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Tổng người dùng</h3>
              <p className="text-3xl font-bold text-blue-600">
                {statsResult.success && "overview" in statsResult.data
                  ? (statsResult.data as AdminDashboardStats).overview
                      .total_users
                  : 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Tổng việc làm</h3>
              <p className="text-3xl font-bold text-green-600">
                {statsResult.success && "overview" in statsResult.data
                  ? (statsResult.data as AdminDashboardStats).overview
                      .total_jobs
                  : 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Tổng công ty</h3>
              <p className="text-3xl font-bold text-purple-600">
                {statsResult.success && "overview" in statsResult.data
                  ? (statsResult.data as AdminDashboardStats).overview
                      .total_companies
                  : 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Chờ duyệt</h3>
              <p className="text-3xl font-bold text-orange-600">
                {statsResult.success && "content_moderation" in statsResult.data
                  ? (statsResult.data as AdminDashboardStats).content_moderation
                      .pending_job_approvals
                  : 0}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
