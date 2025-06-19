"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface JobSearchProps {
  defaultValue?: string;
}

export function JobSearch({ defaultValue }: JobSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(defaultValue || "");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    // Reset page when search changes
    params.delete("page");

    router.push(`/jobs?${params.toString()}`);
  }, [debouncedSearch, searchParams, router]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        type="text"
        placeholder="Tìm kiếm công việc, công ty, kỹ năng..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 h-12 text-base"
      />
    </div>
  );
}
