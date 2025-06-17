import { Suspense } from "react";
import { JobDetails } from "./_components/job-details";
import { RelatedJobs } from "./_components/related-jobs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface JobDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    ref?: string;
  }>;
}

export default async function JobDetailPage({
  params,
  searchParams,
}: JobDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link
              href={
                resolvedSearchParams.ref === "dashboard"
                  ? "/dashboard"
                  : "/jobs"
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {resolvedSearchParams.ref === "dashboard"
                ? "Quay lại Dashboard"
                : "Quay lại danh sách"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <Suspense fallback={<JobDetailsSkeleton />}>
              <JobDetails jobId={resolvedParams.id} />
            </Suspense>
          </div>

          {/* Sidebar - Related Jobs */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Suspense fallback={<RelatedJobsSkeleton />}>
                <RelatedJobs jobId={resolvedParams.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 w-16 rounded" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>

      {/* Content Sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedJobsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-3 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
