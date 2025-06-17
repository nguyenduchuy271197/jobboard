"use server";

import { createClient } from "@/lib/supabase/server";
import { checkAdminAuth } from "@/lib/auth-utils";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import type { UserStatistics } from "@/types/custom.types";

type Result = { 
  success: true; 
  data: UserStatistics;
} | { 
  success: false; 
  error: string 
};

export async function getUserStatistics(): Promise<Result> {
  try {
    // Step 1: Check admin authentication
    const authCheck = await checkAdminAuth();
    if (!authCheck.success) {
      return { success: false, error: authCheck.error };
    }

    const supabase = await createClient();

    // Step 2: Get user statistics overview
    const { data: totalStats, error: statsError } = await supabase
      .from("profiles")
      .select("role, is_active, created_at")
      .order("created_at");

    if (statsError || !totalStats) {
      return { success: false, error: ERROR_MESSAGES.DATABASE.QUERY_FAILED };
    }

    // Step 3: Calculate statistics
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalUsers = totalStats.length;
    const activeUsers = totalStats.filter(u => u.is_active).length;
    const inactiveUsers = totalUsers - activeUsers;
    const jobSeekers = totalStats.filter(u => u.role === "job_seeker").length;
    const employers = totalStats.filter(u => u.role === "employer").length;
    const admins = totalStats.filter(u => u.role === "admin").length;
    
    const newUsersThisMonth = totalStats.filter(u => 
      new Date(u.created_at) >= thisMonth
    ).length;
    
    const newUsersLastMonth = totalStats.filter(u => {
      const createdAt = new Date(u.created_at);
      return createdAt >= lastMonth && createdAt < thisMonth;
    }).length;

    const growthRate = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;

    // Step 4: Prepare users by role data
    const usersByRole = [
      { role: "job_seeker" as const, count: jobSeekers },
      { role: "employer" as const, count: employers },
      { role: "admin" as const, count: admins },
    ];

    // Step 5: Calculate users by month (last 12 months)
    const usersByMonth: { month: string; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = totalStats.filter(u => {
        const createdAt = new Date(u.created_at);
        return createdAt >= date && createdAt < nextDate;
      }).length;
      
      usersByMonth.push({
        month: date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short' }),
        count,
      });
    }

    // Step 6: Get top locations from job seeker profiles
    const { data: locationStats } = await supabase
      .from("job_seeker_profiles")
      .select(`
        preferred_location:locations(name)
      `)
      .not("preferred_location_id", "is", null);

    const topLocations: { location: string; count: number }[] = [];
    if (locationStats) {
      const locationCounts: Record<string, number> = {};
      locationStats.forEach(stat => {
        if (stat.preferred_location?.name) {
          locationCounts[stat.preferred_location.name] = 
            (locationCounts[stat.preferred_location.name] || 0) + 1;
        }
      });

      Object.entries(locationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([location, count]) => {
          topLocations.push({ location, count });
        });
    }

    // Step 7: Compile final statistics
    const statistics: UserStatistics = {
      total_users: totalUsers,
      active_users: activeUsers,
      inactive_users: inactiveUsers,
      job_seekers: jobSeekers,
      employers: employers,
      admins: admins,
      new_users_this_month: newUsersThisMonth,
      new_users_last_month: newUsersLastMonth,
      growth_rate: Math.round(growthRate * 100) / 100,
      users_by_role: usersByRole,
      users_by_month: usersByMonth,
      top_locations: topLocations,
    };

    return {
      success: true,
      data: statistics,
    };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
} 