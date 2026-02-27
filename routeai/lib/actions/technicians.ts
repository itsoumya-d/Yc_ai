import { supabase } from "@/lib/supabase";
import type { Technician } from "@/types/index";

export async function getTechnicians(userId: string) {
  const { data, error } = await supabase
    .from("technicians")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .order("name");

  return { data: (data as Technician[]) ?? [], error: error?.message };
}

export async function createTechnician(input: {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  skills?: string[];
}) {
  const { data, error } = await supabase
    .from("technicians")
    .insert({
      user_id: input.userId,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      skills: input.skills ?? [],
      active: true,
      status: "available",
    })
    .select()
    .single();

  return { data: data as Technician | null, error: error?.message };
}

export async function updateTechnicianStatus(
  technicianId: string,
  status: Technician["status"],
  currentJobId?: string
) {
  const updates: Partial<Technician> = { status };
  if (currentJobId !== undefined) {
    updates.current_job_id = currentJobId;
  }

  const { data, error } = await supabase
    .from("technicians")
    .update(updates)
    .eq("id", technicianId)
    .select()
    .single();

  return { data: data as Technician | null, error: error?.message };
}

export async function updateTechnicianLocation(
  technicianId: string,
  lat: number,
  lng: number
) {
  const { error } = await supabase
    .from("technicians")
    .update({
      last_lat: lat,
      last_lng: lng,
      last_seen_at: new Date().toISOString(),
    })
    .eq("id", technicianId);

  return { error: error?.message };
}

export async function getTechnicianWorkload(
  userId: string,
  date: string
): Promise<Array<{ technician: Technician; jobCount: number; totalMinutes: number }>> {
  const { data: technicians } = await supabase
    .from("technicians")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);

  if (!technicians) return [];

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("technician_id, estimated_duration")
    .eq("user_id", userId)
    .gte("scheduled_date", dateStart.toISOString())
    .lte("scheduled_date", dateEnd.toISOString());

  return technicians.map((tech: Technician) => {
    const techJobs = (jobs ?? []).filter((j) => j.technician_id === tech.id);
    const totalMinutes = techJobs.reduce(
      (sum, j) => sum + (j.estimated_duration ?? 60),
      0
    );
    return {
      technician: tech,
      jobCount: techJobs.length,
      totalMinutes,
    };
  });
}
