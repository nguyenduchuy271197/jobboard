import { PageHeader } from "@/components/page-header";
import { DashboardPageWrapper } from "@/components/page-wrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tags, MapPin } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  const categories = [
    {
      title: "Ngành nghề",
      description: "Quản lý danh sách ngành nghề và lĩnh vực công việc",
      icon: Tags,
      href: "/dashboard/admin/categories/industries",
      count: "15 ngành nghề",
    },
    {
      title: "Địa điểm",
      description: "Quản lý danh sách tỉnh thành và khu vực",
      icon: MapPin,
      href: "/dashboard/admin/categories/locations",
      count: "63 tỉnh/thành",
    },
  ];

  return (
    <DashboardPageWrapper>
      <PageHeader
        title="Quản lý Danh mục"
        description="Quản lý các danh mục hệ thống như ngành nghề, địa điểm"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Card
              key={category.href}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {category.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.count}
                  </span>
                  <Button asChild>
                    <Link href={category.href}>Quản lý</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardPageWrapper>
  );
}
