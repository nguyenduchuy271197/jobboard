export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_status_history: {
        Row: {
          application_id: number
          changed_by: string
          created_at: string
          id: number
          new_status: Database["public"]["Enums"]["application_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["application_status"] | null
        }
        Insert: {
          application_id: number
          changed_by: string
          created_at?: string
          id?: never
          new_status: Database["public"]["Enums"]["application_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["application_status"] | null
        }
        Update: {
          application_id?: number
          changed_by?: string
          created_at?: string
          id?: never
          new_status?: Database["public"]["Enums"]["application_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["application_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_id: string
          applied_at: string
          cover_letter: string | null
          custom_cv_path: string | null
          id: number
          job_id: number
          notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          status_updated_at: string
          status_updated_by: string | null
        }
        Insert: {
          applicant_id: string
          applied_at?: string
          cover_letter?: string | null
          custom_cv_path?: string | null
          id?: never
          job_id: number
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          status_updated_at?: string
          status_updated_by?: string | null
        }
        Update: {
          applicant_id?: string
          applied_at?: string
          cover_letter?: string | null
          custom_cv_path?: string | null
          id?: never
          job_id?: number
          notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          status_updated_at?: string
          status_updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_status_updated_by_fkey"
            columns: ["status_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          employee_count: number | null
          founded_year: number | null
          id: number
          industry_id: number | null
          is_verified: boolean
          location_id: number | null
          logo_url: string | null
          name: string
          owner_id: string
          size: Database["public"]["Enums"]["company_size"] | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          id?: never
          industry_id?: number | null
          is_verified?: boolean
          location_id?: number | null
          logo_url?: string | null
          name: string
          owner_id: string
          size?: Database["public"]["Enums"]["company_size"] | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          employee_count?: number | null
          founded_year?: number | null
          id?: never
          industry_id?: number | null
          is_verified?: boolean
          location_id?: number | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          size?: Database["public"]["Enums"]["company_size"] | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_seeker_profiles: {
        Row: {
          created_at: string
          cv_file_path: string | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          github_url: string | null
          headline: string | null
          id: number
          is_looking_for_job: boolean
          linkedin_url: string | null
          portfolio_url: string | null
          preferred_location_id: number | null
          preferred_salary_max: number | null
          preferred_salary_min: number | null
          skills: string[] | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_file_path?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          github_url?: string | null
          headline?: string | null
          id?: never
          is_looking_for_job?: boolean
          linkedin_url?: string | null
          portfolio_url?: string | null
          preferred_location_id?: number | null
          preferred_salary_max?: number | null
          preferred_salary_min?: number | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cv_file_path?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          github_url?: string | null
          headline?: string | null
          id?: never
          is_looking_for_job?: boolean
          linkedin_url?: string | null
          portfolio_url?: string | null
          preferred_location_id?: number | null
          preferred_salary_max?: number | null
          preferred_salary_min?: number | null
          skills?: string[] | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_seeker_profiles_preferred_location_id_fkey"
            columns: ["preferred_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_seeker_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          application_deadline: string | null
          applications_count: number
          benefits: string | null
          company_id: number
          created_at: string
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          id: number
          industry_id: number | null
          is_remote: boolean
          location_id: number | null
          posted_by: string
          published_at: string | null
          requirements: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          address?: string | null
          application_deadline?: string | null
          applications_count?: number
          benefits?: string | null
          company_id: number
          created_at?: string
          description: string
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          id?: never
          industry_id?: number | null
          is_remote?: boolean
          location_id?: number | null
          posted_by: string
          published_at?: string | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          address?: string | null
          application_deadline?: string | null
          applications_count?: number
          benefits?: string | null
          company_id?: number
          created_at?: string
          description?: string
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          id?: never
          industry_id?: number | null
          is_remote?: boolean
          location_id?: number | null
          posted_by?: string
          published_at?: string | null
          requirements?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          id: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          last_sign_in_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_sign_in_at?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_sign_in_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "pending"
        | "reviewing"
        | "interviewing"
        | "accepted"
        | "rejected"
        | "withdrawn"
      company_size: "startup" | "small" | "medium" | "large" | "enterprise"
      employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship"
        | "freelance"
      experience_level:
        | "entry_level"
        | "mid_level"
        | "senior_level"
        | "executive"
      job_status:
        | "draft"
        | "pending_approval"
        | "published"
        | "closed"
        | "archived"
      user_role: "job_seeker" | "employer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "pending",
        "reviewing",
        "interviewing",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      company_size: ["startup", "small", "medium", "large", "enterprise"],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "internship",
        "freelance",
      ],
      experience_level: [
        "entry_level",
        "mid_level",
        "senior_level",
        "executive",
      ],
      job_status: [
        "draft",
        "pending_approval",
        "published",
        "closed",
        "archived",
      ],
      user_role: ["job_seeker", "employer", "admin"],
    },
  },
} as const

