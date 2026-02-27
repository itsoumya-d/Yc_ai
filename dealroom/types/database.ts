export type Deal = {
  id: string;
  user_id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  ai_score: number;
  ai_insights: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  expected_close_date: string | null;
  description: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type DealActivity = {
  id: string;
  deal_id: string;
  user_id: string;
  content: string;
  type: "note" | "email" | "call" | "meeting" | "stage_change";
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      deals: {
        Row: Deal;
        Insert: Omit<Deal, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Deal, "id" | "user_id" | "created_at">>;
      };
      deal_activities: {
        Row: DealActivity;
        Insert: Omit<DealActivity, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DealActivity, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      deal_stage:
        | "lead"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "closed_won"
        | "closed_lost";
      activity_type: "note" | "email" | "call" | "meeting" | "stage_change";
    };
  };
};
