export type Site = {
  id: string;
  user_id: string;
  name: string;
  address: string | null;
  phase: string | null;
  status: "active" | "completed" | "on_hold";
  progress_pct: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type SitePhoto = {
  id: string;
  user_id: string;
  site_id: string | null;
  photo_url: string | null;
  storage_path: string | null;
  construction_phase: string | null;
  notes: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  has_safety_violation: boolean;
  ai_tags: string[] | null;
  ai_description: string | null;
  captured_at: string;
  created_at: string;
};

export type Report = {
  id: string;
  user_id: string;
  site_id: string | null;
  title: string;
  content: string | null;
  photo_count: number | null;
  safety_violations: number | null;
  status: "draft" | "completed" | "shared";
  created_at: string;
  sites?: { name: string } | null;
};

export type Database = {
  public: {
    Tables: {
      sites: {
        Row: Site;
        Insert: Omit<Site, "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<Site, "id" | "user_id" | "created_at">>;
      };
      site_photos: {
        Row: SitePhoto;
        Insert: Omit<SitePhoto, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<SitePhoto, "id" | "user_id" | "created_at">>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<Report, "id" | "user_id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
