export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          product_id: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          product_id: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          product_id?: string
          owner_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          client_name: string
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          price: number
          status: string | null
          tenant_id: string | null
          phone: string | null
        }
        Insert: {
          client_name: string
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          price: number
          status?: string | null
          tenant_id?: string | null
          phone?: string | null
        }
        Update: {
          client_name?: string
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          price?: number
          status?: string | null
          tenant_id?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      },
      reminders: {
        Row: {
          id: string
          tenant_id: string
          title: string
          is_done: boolean
          content: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          tenant_id: string
          title: string
          is_done: boolean
          content: string
        }
        Update: {
          tenant_id: string
          title: string
          is_done: boolean
          content: string
          updated_at: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      },
      settings: {
        Row: {
          id: string
          tenant_id: string
          enable_roles: boolean
          lock_reports_by_password: boolean
          require_password_to_switch_role: boolean
          lock_settings_by_password: boolean
          created_at?: string
          updated_at?: string
        }
        Insert: {
          tenant_id: string
          enable_roles: boolean
          lock_reports_by_password: boolean
          require_password_to_switch_role: boolean
          lock_settings_by_password: boolean
        }
        Update: {
          tenant_id: string
          enable_roles: boolean
          lock_reports_by_password: boolean
          require_password_to_switch_role: boolean
          updated_at: string
          lock_settings_by_password: boolean
        }
        Relationships: [
          {
            foreignKeyName: "settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      },
      roles: {
        Row: {
          id: string
          name: string
          tenant_id: string
          created_at?: string
          updated_at?: string
          can_access_reports: boolean
          can_access_calendar: boolean
          can_access_production: boolean
          can_access_orders: boolean
          can_access_reminders: boolean
          can_access_settings: boolean
          can_access_dashboard: boolean
          can_create_orders: boolean
          can_delete_orders: boolean
          can_edit_orders: boolean
        }
        Insert: {
          name: string
          tenant_id: string
          can_access_reports: boolean
          can_access_calendar: boolean
          can_access_production: boolean
          can_access_orders: boolean
          can_access_reminders: boolean
          can_access_settings: boolean
          can_access_dashboard: boolean
          can_create_orders: boolean
          can_delete_orders: boolean
          can_edit_orders: boolean
        }
        Update: {
          name: string
          tenant_id: string
          updated_at?: string
          can_access_reports: boolean
          can_access_calendar: boolean
          can_access_production: boolean
          can_access_orders: boolean
          can_access_reminders: boolean
          can_access_settings: boolean
          can_access_dashboard: boolean
          can_create_orders: boolean
          can_delete_orders: boolean
          can_edit_orders: boolean
        }
        Relationships: [
          {
            foreignKeyName: "roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          }
        ]
      },
      products: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          plan: string
          product_id: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
          is_trial: boolean,
          cancel_at_period_end: boolean,
          canceled_at: string | null,
          payment_failed_at: string | null,
          grace_period_until: string | null,

        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string | null
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
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
