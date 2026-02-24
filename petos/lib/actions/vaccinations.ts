'use server';

import { createClient } from '@/lib/supabase/server';
import type { HealthRecord } from '@/types/database';

// Common vaccine schedules (months between boosters)
const VACCINE_SCHEDULES: Record<string, number> = {
  rabies: 12,    // annual or 3-year; default to annual
  dhpp: 12,      // annual
  distemper: 12,
  bordetella: 6,
  leptospirosis: 12,
  lyme: 12,
  fvrcp: 12,
  felv: 12,
  heartworm: 12,
  flea: 1,       // monthly
};

function estimateNextDueMonths(vaccineName: string): number {
  const lower = vaccineName.toLowerCase();
  for (const [keyword, months] of Object.entries(VACCINE_SCHEDULES)) {
    if (lower.includes(keyword)) return months;
  }
  return 12; // default to annual
}

export interface VaccinationScheduleItem {
  id: string;
  pet_id: string;
  vaccine_name: string;
  last_given: string;
  next_due: string;
  is_overdue: boolean;
  days_until_due: number;
}

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function getVaccinationSchedule(
  petId?: string
): Promise<ActionResult<VaccinationScheduleItem[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  let query = supabase
    .from('health_records')
    .select('*, pets!inner(user_id)')
    .eq('type', 'vaccination')
    .eq('pets.user_id', user.id)
    .order('date', { ascending: false });

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  const records = (data ?? []) as unknown as (HealthRecord & { pet_id: string })[];

  // Group by pet_id + vaccine title, keep only most recent per vaccine
  const seen = new Set<string>();
  const schedule: VaccinationScheduleItem[] = [];
  const today = new Date();

  for (const record of records) {
    const key = `${record.pet_id}:${record.title.toLowerCase().trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const lastGiven = new Date(record.date);
    const monthsUntilDue = estimateNextDueMonths(record.title);
    const nextDue = new Date(lastGiven);
    nextDue.setMonth(nextDue.getMonth() + monthsUntilDue);

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysUntilDue = Math.round((nextDue.getTime() - today.getTime()) / msPerDay);

    schedule.push({
      id: record.id,
      pet_id: record.pet_id,
      vaccine_name: record.title,
      last_given: record.date,
      next_due: nextDue.toISOString().split('T')[0],
      is_overdue: daysUntilDue < 0,
      days_until_due: daysUntilDue,
    });
  }

  // Sort: overdue first, then by days until due ascending
  schedule.sort((a, b) => a.days_until_due - b.days_until_due);

  return { data: schedule };
}
