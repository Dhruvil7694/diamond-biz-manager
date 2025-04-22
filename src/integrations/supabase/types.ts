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
      clients: {
        Row: {
          company: string
          contact_person: string
          created_at: string
          email: string | null
          four_p_minus_rate: number
          four_p_plus_rate: number
          id: string
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company: string
          contact_person: string
          created_at?: string
          email?: string | null
          four_p_minus_rate: number
          four_p_plus_rate: number
          id?: string
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string
          contact_person?: string
          created_at?: string
          email?: string | null
          four_p_minus_rate?: number
          four_p_plus_rate?: number
          id?: string
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      diamonds: {
        Row: {
          category: string
          client_id: string
          created_at: string
          entry_date: string
          id: string
          kapan_id: string
          market_rate: number
          number_of_diamonds: number
          raw_damage_weight: number | null
          total_value: number
          updated_at: string
          weight_in_karats: number
        }
        Insert: {
          category: string
          client_id: string
          created_at?: string
          entry_date?: string
          id?: string
          kapan_id: string
          market_rate: number
          number_of_diamonds: number
          raw_damage_weight?: number | null
          total_value: number
          updated_at?: string
          weight_in_karats: number
        }
        Update: {
          category?: string
          client_id?: string
          created_at?: string
          entry_date?: string
          id?: string
          kapan_id?: string
          market_rate?: number
          number_of_diamonds?: number
          raw_damage_weight?: number | null
          total_value?: number
          updated_at?: string
          weight_in_karats?: number
        }
        Relationships: [
          {
            foreignKeyName: "diamonds_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          diamond_id: string
          id: string
          invoice_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          diamond_id: string
          id?: string
          invoice_id: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          description?: string | null
          diamond_id?: string
          id?: string
          invoice_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_diamond_id_fkey"
            columns: ["diamond_id"]
            isOneToOne: false
            referencedRelation: "diamonds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_date: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          payment_date?: string | null
          status: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      market_rates: {
        Row: {
          created_at: string
          date: string
          four_p_minus_rate: number
          four_p_plus_rate: number
          id: string
        }
        Insert: {
          created_at?: string
          date?: string
          four_p_minus_rate: number
          four_p_plus_rate: number
          id?: string
        }
        Update: {
          created_at?: string
          date?: string
          four_p_minus_rate?: number
          four_p_plus_rate?: number
          id?: string
        }
        Relationships: []
      }
      company_details: {
        Row: {
          account_holder_name: string
          id: string
          company_name: string
          address: string
          phone: string | null
          email: string | null
          gst_number: string | null
          bank_name: string
          account_number: string
          ifsc_code: string
          branch: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_name: string
          address: string
          phone?: string | null
          email?: string | null
          gst_number?: string | null
          bank_name: string
          account_number: string
          ifsc_code: string
          branch: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_name?: string
          address?: string
          phone?: string | null
          email?: string | null
          gst_number?: string | null
          bank_name?: string
          account_number?: string
          ifsc_code?: string
          branch?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_diamond_value: {
        Args: {
          category: string
          weight_in_karats: number
          number_of_diamonds: number
          four_p_plus_rate: number
          four_p_minus_rate: number
          raw_damage_weight?: number
        }
        Returns: number
      }
      determine_diamond_category: {
        Args: { weight_in_karats: number; number_of_diamonds: number }
        Returns: string
      }
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