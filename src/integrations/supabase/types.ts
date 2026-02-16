export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_links: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      health_check_log: {
        Row: {
          checked_at: string
          error_message: string | null
          function_name: string
          id: string
          is_healthy: boolean
          status_code: number | null
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          function_name: string
          id?: string
          is_healthy?: boolean
          status_code?: number | null
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          function_name?: string
          id?: string
          is_healthy?: boolean
          status_code?: number | null
        }
        Relationships: []
      }
      market_movers: {
        Row: {
          ai_comment: string | null
          coin_name: string
          created_at: string
          date: string
          id: string
          price_change: number
          ticker: string
          type: string
        }
        Insert: {
          ai_comment?: string | null
          coin_name: string
          created_at?: string
          date: string
          id?: string
          price_change: number
          ticker: string
          type: string
        }
        Update: {
          ai_comment?: string | null
          coin_name?: string
          created_at?: string
          date?: string
          id?: string
          price_change?: number
          ticker?: string
          type?: string
        }
        Relationships: []
      }
      migration_progress: {
        Row: {
          created_at: string
          current_offset: number
          id: string
          is_complete: boolean
          last_run_at: string | null
          migration_name: string
          total_count: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_offset?: number
          id?: string
          is_complete?: boolean
          last_run_at?: string | null
          migration_name: string
          total_count?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_offset?: number
          id?: string
          is_complete?: boolean
          last_run_at?: string | null
          migration_name?: string
          total_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          created_at: string
          date: string
          full_content: string | null
          id: string
          image_url: string | null
          slug: string
          source_url: string | null
          summary: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          full_content?: string | null
          id?: string
          image_url?: string | null
          slug: string
          source_url?: string | null
          summary: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          full_content?: string | null
          id?: string
          image_url?: string | null
          slug?: string
          source_url?: string | null
          summary?: string
          title?: string
        }
        Relationships: []
      }
      news_scrape_log: {
        Row: {
          articles_fetched: number | null
          articles_saved: number | null
          attempt_number: number
          completed_at: string | null
          date: string
          error_message: string | null
          id: string
          started_at: string
          status: string
        }
        Insert: {
          articles_fetched?: number | null
          articles_saved?: number | null
          attempt_number?: number
          completed_at?: string | null
          date?: string
          error_message?: string | null
          id?: string
          started_at?: string
          status: string
        }
        Update: {
          articles_fetched?: number | null
          articles_saved?: number | null
          attempt_number?: number
          completed_at?: string | null
          date?: string
          error_message?: string | null
          id?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      report_generation_log: {
        Row: {
          attempt_number: number
          created_at: string
          date: string
          duration_ms: number | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          date: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          date?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string
          created_at: string
          date: string
          id: string
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          date: string
          id?: string
          title: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          date?: string
          id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_health_checks: { Args: never; Returns: undefined }
      generate_slug: { Args: { title: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
