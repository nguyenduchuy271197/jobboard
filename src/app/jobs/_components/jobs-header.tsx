import { Briefcase } from "lucide-react";

export function JobsHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Briefcase className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold text-foreground">
          Tìm Việc Làm Mơ Ước
        </h1>
      </div>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Khám phá hàng nghìn cơ hội việc làm từ các công ty hàng đầu. Tìm kiếm
        theo từ khóa, địa điểm và ngành nghề phù hợp với bạn.
      </p>
    </div>
  );
}
