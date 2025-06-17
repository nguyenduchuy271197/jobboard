"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  query: z.string().min(1, "Từ khóa tìm kiếm không được để trống"),
  limit: z.number().min(1).max(20).optional().default(10),
  type: z.enum(["all", "jobs", "companies", "skills", "locations", "industries"]).optional().default("all"),
});

export type SearchSuggestionsParams = z.infer<typeof schema>;

export type SearchSuggestion = {
  id: number | string;
  text: string;
  type: "job" | "company" | "skill" | "location" | "industry";
  metadata?: {
    company_name?: string;
    location_name?: string;
    industry_name?: string;
    jobs_count?: number;
  };
};

export type SearchSuggestionsResult = {
  suggestions: Array<SearchSuggestion>;
  total_count: number;
  query: string;
};

type Result = 
  | { success: true; data: SearchSuggestionsResult }
  | { success: false; error: string };

export async function getSearchSuggestions(params: SearchSuggestionsParams): Promise<Result> {
  try {
    const data = schema.parse(params);
    const supabase = await createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: "Vui lòng đăng nhập để lấy gợi ý" };
    }

    const searchQuery = `%${data.query}%`;
    const suggestions: SearchSuggestion[] = [];

    // Gợi ý từ job titles
    if (data.type === "all" || data.type === "jobs") {
      const { data: jobSuggestions, error: jobsError } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          company:companies!inner(name),
          location:locations(name)
        `)
        .ilike("title", searchQuery)
        .eq("status", "published")
        .limit(Math.floor(data.limit / (data.type === "all" ? 5 : 1)));

      if (!jobsError && jobSuggestions) {
        suggestions.push(...jobSuggestions.map(job => ({
          id: job.id,
          text: job.title,
          type: "job" as const,
          metadata: {
            company_name: job.company?.name,
            location_name: job.location?.name,
          },
        })));
      }
    }

    // Gợi ý từ company names
    if (data.type === "all" || data.type === "companies") {
      const { data: companySuggestions, error: companiesError } = await supabase
        .from("companies")
        .select(`
          id,
          name,
          industry:industries(name),
          location:locations(name)
        `)
        .ilike("name", searchQuery)
        .eq("is_verified", true)
        .limit(Math.floor(data.limit / (data.type === "all" ? 5 : 1)));

      if (!companiesError && companySuggestions) {
        suggestions.push(...companySuggestions.map(company => ({
          id: company.id,
          text: company.name,
          type: "company" as const,
          metadata: {
            industry_name: company.industry?.name,
            location_name: company.location?.name,
          },
        })));
      }
    }

    // Gợi ý từ locations
    if (data.type === "all" || data.type === "locations") {
      const { data: locationSuggestions, error: locationsError } = await supabase
        .from("locations")
        .select("id, name")
        .ilike("name", searchQuery)
        .limit(Math.floor(data.limit / (data.type === "all" ? 5 : 1)));

      if (!locationsError && locationSuggestions) {
        // Đếm số lượng jobs tại mỗi location
        for (const location of locationSuggestions) {
          const { count } = await supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("location_id", location.id)
            .eq("status", "published");

          suggestions.push({
            id: location.id,
            text: location.name,
            type: "location",
            metadata: {
              jobs_count: count || 0,
            },
          });
        }
      }
    }

    // Gợi ý từ industries
    if (data.type === "all" || data.type === "industries") {
      const { data: industrySuggestions, error: industriesError } = await supabase
        .from("industries")
        .select("id, name")
        .ilike("name", searchQuery)
        .eq("is_active", true)
        .limit(Math.floor(data.limit / (data.type === "all" ? 5 : 1)));

      if (!industriesError && industrySuggestions) {
        // Đếm số lượng jobs trong mỗi industry
        for (const industry of industrySuggestions) {
          const { count } = await supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("industry_id", industry.id)
            .eq("status", "published");

          suggestions.push({
            id: industry.id,
            text: industry.name,
            type: "industry",
            metadata: {
              jobs_count: count || 0,
            },
          });
        }
      }
    }

    // Gợi ý từ skills (từ job requirements và skills_required)
    if (data.type === "all" || data.type === "skills") {
      const { data: skillJobs, error: skillsError } = await supabase
        .from("jobs")
        .select("skills_required")
        .not("skills_required", "is", null)
        .eq("status", "published");

      if (!skillsError && skillJobs) {
        const allSkills = new Set<string>();
        skillJobs.forEach(job => {
          if (job.skills_required) {
            job.skills_required.forEach((skill: string) => {
              if (skill.toLowerCase().includes(data.query.toLowerCase())) {
                allSkills.add(skill);
              }
            });
          }
        });

        const skillSuggestions = Array.from(allSkills)
          .slice(0, Math.floor(data.limit / (data.type === "all" ? 5 : 1)))
          .map((skill, index) => ({
            id: `skill_${index}`,
            text: skill,
            type: "skill" as const,
          }));

        suggestions.push(...skillSuggestions);
      }
    }

    // Sắp xếp suggestions theo độ relevance (exact matches first)
    const sortedSuggestions = suggestions
      .sort((a, b) => {
        const aExact = a.text.toLowerCase() === data.query.toLowerCase();
        const bExact = b.text.toLowerCase() === data.query.toLowerCase();
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = a.text.toLowerCase().startsWith(data.query.toLowerCase());
        const bStarts = b.text.toLowerCase().startsWith(data.query.toLowerCase());
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return a.text.localeCompare(b.text);
      })
      .slice(0, data.limit);

    const result: SearchSuggestionsResult = {
      suggestions: sortedSuggestions,
      total_count: sortedSuggestions.length,
      query: data.query,
    };

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Lỗi hệ thống khi lấy gợi ý" };
  }
} 