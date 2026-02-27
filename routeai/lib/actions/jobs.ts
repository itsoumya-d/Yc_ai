import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/index";

export async function getJobs(userId: string, options?: {
  date?: string;
  status?: string;
  technicianId?: string;
}) {
  let query = supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_date", { ascending: true });

  if (options?.date) {
    const dateStart = new Date(options.date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(options.date);
    dateEnd.setHours(23, 59, 59, 999);
    query = query
      .gte("scheduled_date", dateStart.toISOString())
      .lte("scheduled_date", dateEnd.toISOString());
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.technicianId) {
    query = query.eq("technician_id", options.technicianId);
  }

  const { data, error } = await query;
  return { data: (data as Job[]) ?? [], error: error?.message };
}

export async function getJob(jobId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  return { data: data as Job | null, error: error?.message };
}

export async function createJob(job: Omit<Job, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("jobs")
    .insert(job)
    .select()
    .single();

  return { data: data as Job | null, error: error?.message };
}

export async function updateJobStatus(
  jobId: string,
  status: Job["status"],
  additionalUpdates?: Partial<Job>
) {
  const updates: Partial<Job> = { status, ...additionalUpdates };

  if (status === "in_progress") {
    updates.started_at = new Date().toISOString();
  } else if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", jobId)
    .select()
    .single();

  return { data: data as Job | null, error: error?.message };
}

export async function assignTechnician(jobId: string, technicianId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .update({ technician_id: technicianId })
    .eq("id", jobId)
    .select()
    .single();

  return { data: data as Job | null, error: error?.message };
}

export async function updateRouteOrder(jobUpdates: Array<{ id: string; route_order: number }>) {
  const promises = jobUpdates.map((update) =>
    supabase
      .from("jobs")
      .update({ route_order: update.route_order })
      .eq("id", update.id)
  );

  await Promise.all(promises);
  return { error: null };
}

export async function deleteJob(jobId: string) {
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  return { error: error?.message };
}
