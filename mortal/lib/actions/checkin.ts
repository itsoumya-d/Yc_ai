// Dead man switch check-in logic
import { supabase } from "../supabase";

export async function recordCheckIn(method: 'biometric' | 'tap' | 'app_open' = 'tap'): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();
  await supabase.from('check_ins').insert({
    user_id: user.id,
    checked_in_at: now,
    method,
  });
  await supabase.from('profiles').update({ last_checkin: now }).eq('id', user.id);
}

export async function getDaysSinceLastCheckIn(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('profiles')
    .select('last_checkin')
    .eq('id', user.id)
    .single();

  if (!data?.last_checkin) return 0;
  const diff = Date.now() - new Date(data.last_checkin).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export async function updateCheckInFrequency(days: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ checkin_frequency_days: days })
    .eq('id', user.id);
  if (error) throw error;
}

export async function isDeadManSwitchTriggered(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('profiles')
    .select('last_checkin, checkin_frequency_days')
    .eq('id', user.id)
    .single();

  if (!data?.last_checkin) return false;
  const days = Math.floor((Date.now() - new Date(data.last_checkin).getTime()) / (1000 * 60 * 60 * 24));
  return days >= (data.checkin_frequency_days ?? 30);
}
