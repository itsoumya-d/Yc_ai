export type Job = {
  id: string;
  user_id: string;
  technician_id: string | null;
  title: string;
  job_type: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "urgent" | "high" | "normal" | "low";
  scheduled_date: string;
  scheduled_time: string | null;
  estimated_duration: number | null;
  route_order: number | null;
  checklist: boolean[] | null;
  field_notes: string[] | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Technician = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  skills: string[] | null;
  active: boolean;
  status: "available" | "en_route" | "on_job" | "offline";
  current_job_id: string | null;
  last_lat: number | null;
  last_lng: number | null;
  last_seen_at: string | null;
  jobs_today: number | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      jobs: {
        Row: Job;
        Insert: Omit<Job, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Job, "id" | "user_id" | "created_at">>;
      };
      technicians: {
        Row: Technician;
        Insert: Omit<Technician, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Technician, "id" | "user_id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
