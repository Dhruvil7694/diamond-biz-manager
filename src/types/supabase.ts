export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          contact_person: string;
          phone: string;
          email: string;
          company: string;
          location: string | null;
          four_p_plus_rate: number;
          four_p_minus_rate: number;
          payment_terms: string;
          notes: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at' | 'created_by'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      diamonds: {
        Row: {
          id: string;
          entry_date: string;
          client_id: string;
          kapan_id: string;
          number_of_diamonds: number;
          weight_in_karats: number;
          market_rate: number;
          category: '4P Plus' | '4P Minus';
          raw_damage_weight?: number;
          total_value: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['diamonds']['Row'], 'id' | 'created_at' | 'updated_at' | 'category' | 'total_value' | 'created_by'>;
        Update: Partial<Database['public']['Tables']['diamonds']['Insert']>;
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          client_id: string;
          diamond_ids: string[];
          total_amount: number;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
          payment_date: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['invoices']['Row'], 'id' | 'created_at' | 'updated_at' | 'created_by'>;
        Update: Partial<Database['public']['Tables']['invoices']['Insert']>;
      };
      market_rates: {
        Row: {
          id: string;
          date: string;
          four_p_plus_rate: number;
          four_p_minus_rate: number;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['market_rates']['Row'], 'id' | 'created_at' | 'updated_at' | 'created_by'>;
        Update: Partial<Database['public']['Tables']['market_rates']['Insert']>;
      };
    };
  };
};
