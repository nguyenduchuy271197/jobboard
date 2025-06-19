import { Suspense } from "react";
import { JobListings } from "./_components/job-listings";
import { JobFilters } from "./_components/job-filters";
import { JobSearch } from "./_components/job-search";
import { Skeleton } from "@/components/ui/skeleton";

interface JobsPageProps {
  searchParams: Promise<{
    search?: string;
    industry?: string;
    location?: string;
    employment_type?: string;
    experience_level?: string;
    salary_min?: string;
    salary_max?: string;
    is_remote?: string;
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tìm việc làm
              </h1>
              <p className="text-muted-foreground">
                Khám phá hàng ngàn cơ hội việc làm từ các công ty hàng đầu
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl">
              <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                <JobSearch defaultValue={resolvedSearchParams.search} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Suspense fallback={<FiltersSkeleton />}>
                <JobFilters searchParams={resolvedSearchParams} />
              </Suspense>
            </div>
          </div>

          {/* Job Listings */}
          <div className="lg:col-span-3">
            <Suspense fallback={<JobListingsSkeleton />}>
              <JobListings searchParams={resolvedSearchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-20" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

function JobListingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-12 w-12 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
