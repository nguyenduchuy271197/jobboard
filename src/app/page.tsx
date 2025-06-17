import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  BriefcaseIcon,
  BuildingIcon,
  UsersIcon,
  TrendingUpIcon,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BriefcaseIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">JobBoard</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/jobs"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Việc làm
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Đăng nhập
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Đăng ký</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Tìm công việc <span className="text-primary">mơ ước</span> của bạn
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu. Tìm
            kiếm, ứng tuyển và phát triển sự nghiệp của bạn ngay hôm nay.
          </p>

          {/* Quick Search */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm vị trí, công ty..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <Link href="/jobs">
                <Button size="lg" className="px-8">
                  Tìm kiếm
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/jobs">
              <Button variant="outline" size="lg">
                Xem tất cả việc làm
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg">Đăng ký ngay</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <BriefcaseIcon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">10,000+</h3>
              <p className="text-muted-foreground">Việc làm đang tuyển</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <BuildingIcon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">500+</h3>
              <p className="text-muted-foreground">Công ty đối tác</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <UsersIcon className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-2">50,000+</h3>
              <p className="text-muted-foreground">Ứng viên thành công</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Việc làm nổi bật</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá những cơ hội việc làm hot nhất từ các công ty hàng đầu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Sample Job Cards */}
            {sampleJobs.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {job.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <BuildingIcon className="h-4 w-4" />
                        {job.company}
                      </CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BriefcaseIcon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {job.location}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-primary">
                        {job.salary}
                      </span>
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm">Xem chi tiết</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/jobs">
              <Button variant="outline" size="lg">
                Xem thêm việc làm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <TrendingUpIcon className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng cho bước tiến mới?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Tham gia cùng hàng ngàn ứng viên đã tìm được công việc mơ ước thông
            qua nền tảng của chúng tôi
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary">
                Đăng ký miễn phí
              </Button>
            </Link>
            <Link href="/jobs">
              <Button
                size="lg"
                variant="outline"
                className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Tìm việc ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BriefcaseIcon className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">JobBoard</span>
              </div>
              <p className="text-muted-foreground">
                Nền tảng tìm việc làm hàng đầu Việt Nam
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Dành cho ứng viên</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/jobs" className="hover:text-primary">
                    Tìm việc làm
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary">
                    Hồ sơ của tôi
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Dành cho nhà tuyển dụng</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-primary">
                    Đăng tin tuyển dụng
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-primary">
                    Quản lý ứng viên
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-primary">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary">
                    Câu hỏi thường gặp
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 JobBoard. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sample data for demonstration
const sampleJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechCorp Vietnam",
    location: "Hồ Chí Minh",
    salary: "20-30 triệu VNĐ",
    tags: ["React", "TypeScript", "Remote"],
  },
  {
    id: 2,
    title: "Product Manager",
    company: "StartupXYZ",
    location: "Hà Nội",
    salary: "25-35 triệu VNĐ",
    tags: ["Product", "Strategy", "Agile"],
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "BigTech Co.",
    location: "Đà Nẵng",
    salary: "18-28 triệu VNĐ",
    tags: ["Node.js", "PostgreSQL", "AWS"],
  },
];
