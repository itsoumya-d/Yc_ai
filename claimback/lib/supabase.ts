import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL\!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY\!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      bills: {
        Row: {
          id: string;
          user_id: string;
          bill_type: string;
          provider_name: string;
          bill_date: string | null;
          due_date: string | null;
          total_amount: number;
          image_url: string | null;
          status: string;
          analysis_raw: string | null;
          total_overcharge: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["bills"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["bills"]["Insert"]>;
      };
      disputes: {
        Row: {
          id: string;
          user_id: string;
          bill_id: string;
          status: string;
          dispute_letter: string | null;
          dispute_amount: number;
          resolved_amount: number | null;
          provider_name: string;
          bill_type: string;
          submitted_at: string | null;
          resolved_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["disputes"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["disputes"]["Insert"]>;
      };
      line_items: {
        Row: {
          id: string;
          bill_id: string;
          description: string;
          code: string | null;
          quantity: number;
          billed_amount: number;
          fair_amount: number | null;
          is_overcharge: boolean;
          overcharge_reason: string | null;
          overcharge_amount: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["line_items"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["line_items"]["Insert"]>;
      };
      savings_events: {
        Row: {
          id: string;
          user_id: string;
          dispute_id: string | null;
          bill_id: string | null;
          amount: number;
          event_type: string;
          description: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["savings_events"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["savings_events"]["Insert"]>;
      };
    };
  };
};

