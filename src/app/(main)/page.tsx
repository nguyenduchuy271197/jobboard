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
  BriefcaseIcon,
  BuildingIcon,
  UsersIcon,
  TrendingUpIcon,
} from "lucide-react";

export default function HomePage() {
  return (
    <div>
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
          </div>
        </div>
      </section>
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
