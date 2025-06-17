"use client";

import { useState } from "react";
import { JobsHeader } from "./_components/jobs-header";
import { JobsSearch, JobSearchFilters } from "./_components/jobs-search";
import { JobsList } from "./_components/jobs-list";

export default function JobsPage() {
  const [filters, setFilters] = useState<JobSearchFilters>({});

  const handleFiltersChange = (newFilters: JobSearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <JobsHeader />
      <JobsSearch onFiltersChange={handleFiltersChange} />
      <JobsList filters={filters} />
    </div>
  );
}
