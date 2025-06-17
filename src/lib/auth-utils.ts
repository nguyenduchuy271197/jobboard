import { createClient } from "@/lib/supabase/server";
import { UserRole, Profile } from "@/types/custom.types";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import type { User } from "@supabase/supabase-js";

type BaseAuthResult = 
  | { success: true; user: User }
  | { success: false; error: string };

type AuthWithProfileResult = 
  | { success: true; user: User; profile: Profile }
  | { success: false; error: string };

type AuthWithRoleResult = 
  | { success: true; user: User; profile: Profile; hasRole: true }
  | { success: false; error: string; hasRole: false };

/**
 * Basic authentication check
 * Returns user if authenticated, error if not
 */
export async function checkAuth(): Promise<BaseAuthResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, error: ERROR_MESSAGES.AUTH.NOT_LOGGED_IN };
    }

    return { success: true, user };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
}

/**
 * Authentication check with user profile
 * Returns user and profile if authenticated, error if not
 */
export async function checkAuthWithProfile(): Promise<AuthWithProfileResult> {
  try {
    const authCheck = await checkAuth();
    if (!authCheck.success) {
      return authCheck as { success: false; error: string };
    }

    const supabase = await createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authCheck.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: ERROR_MESSAGES.USER.PROFILE_NOT_FOUND };
    }

    return { success: true, user: authCheck.user, profile };
  } catch {
    return { success: false, error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR };
  }
}

/**
 * Check if user has specific role
 * Returns user, profile and role check result
 */
export async function checkAuthWithRole(requiredRole: UserRole): Promise<AuthWithRoleResult> {
  try {
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { ...authCheck, hasRole: false } as AuthWithRoleResult;
    }

    const hasRole = authCheck.profile.role === requiredRole;
    
    if (!hasRole) {
      let errorMessage: string;
      switch (requiredRole) {
        case "admin":
          errorMessage = ERROR_MESSAGES.AUTH.ADMIN_ONLY;
          break;
        default:
          errorMessage = ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      }
      
      return { 
        success: false, 
        error: errorMessage, 
        hasRole: false 
      };
    }

    return { 
      success: true, 
      user: authCheck.user, 
      profile: authCheck.profile, 
      hasRole: true 
    };
  } catch {
    return { 
      success: false, 
      error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR, 
      hasRole: false 
    };
  }
}

/**
 * Check if user has any of the specified roles
 * Returns user, profile and role check result
 */
export async function checkAuthWithAnyRole(requiredRoles: UserRole[]): Promise<AuthWithRoleResult> {
  try {
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { ...authCheck, hasRole: false } as AuthWithRoleResult;
    }

    const hasRole = requiredRoles.includes(authCheck.profile.role);
    
    if (!hasRole) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.AUTH.UNAUTHORIZED, 
        hasRole: false 
      };
    }

    return { 
      success: true, 
      user: authCheck.user, 
      profile: authCheck.profile, 
      hasRole: true 
    };
  } catch {
    return { 
      success: false, 
      error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR, 
      hasRole: false 
    };
  }
}

/**
 * Admin authentication check
 * Shorthand for checkAuthWithRole("admin")
 */
export async function checkAdminAuth(): Promise<AuthWithRoleResult> {
  return checkAuthWithRole("admin");
}

/**
 * Employer authentication check
 * Shorthand for checkAuthWithRole("employer")
 */
export async function checkEmployerAuth(): Promise<AuthWithRoleResult> {
  return checkAuthWithRole("employer");
}

/**
 * Check if user is admin or employer
 * Useful for actions that both admins and employers can perform
 */
export async function checkAdminOrEmployerAuth(): Promise<AuthWithRoleResult> {
  return checkAuthWithAnyRole(["admin", "employer"]);
}

/**
 * Check if user owns a resource or is admin
 * Useful for actions where users can only access their own resources unless they're admin
 */
export async function checkOwnershipOrAdmin(resourceUserId: string): Promise<AuthWithRoleResult> {
  try {
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { ...authCheck, hasRole: false } as AuthWithRoleResult;
    }

    const isOwner = authCheck.user.id === resourceUserId;
    const isAdmin = authCheck.profile.role === "admin";
    
    if (!isOwner && !isAdmin) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.AUTH.UNAUTHORIZED, 
        hasRole: false 
      };
    }

    return { 
      success: true, 
      user: authCheck.user, 
      profile: authCheck.profile, 
      hasRole: true 
    };
  } catch {
    return { 
      success: false, 
      error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR, 
      hasRole: false 
    };
  }
}

/**
 * Check if user can access company resources
 * Checks if user is admin, company owner, or company member
 */
export async function checkCompanyAccess(companyId: number): Promise<AuthWithRoleResult> {
  try {
    const authCheck = await checkAuthWithProfile();
    if (!authCheck.success) {
      return { ...authCheck, hasRole: false } as AuthWithRoleResult;
    }

    // Admin can access any company
    if (authCheck.profile.role === "admin") {
      return { 
        success: true, 
        user: authCheck.user, 
        profile: authCheck.profile, 
        hasRole: true 
      };
    }

    // Check if user is associated with the company
    const supabase = await createClient();
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("owner_id")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.COMPANY.NOT_FOUND, 
        hasRole: false 
      };
    }

    const hasAccess = company.owner_id === authCheck.user.id;
    
    if (!hasAccess) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.COMPANY.UNAUTHORIZED_ACCESS, 
        hasRole: false 
      };
    }

    return { 
      success: true, 
      user: authCheck.user, 
      profile: authCheck.profile, 
      hasRole: true 
    };
  } catch {
    return { 
      success: false, 
      error: ERROR_MESSAGES.GENERIC.UNEXPECTED_ERROR, 
      hasRole: false 
    };
  }
} 