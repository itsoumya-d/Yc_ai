import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'RouteAI: Missing Supabase environment variables. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ---------------------------------------------------------------------------
// Driver helpers
// ---------------------------------------------------------------------------

export async function getDriverProfile(userId: string) {
  const { data, error } = await supabase
    .from('drivers')
    .select('*, organizations(*)')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateDriverLocation(
  driverId: string,
  latitude: number,
  longitude: number
) {
  const { error } = await supabase
    .from('drivers')
    .update({ current_lat: latitude, current_lng: longitude, updated_at: new Date().toISOString() })
    .eq('id', driverId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Route / Stop helpers
// ---------------------------------------------------------------------------

export async function getTodayRoute(driverId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('routes')
    .select('*, stops(*, jobs(*, customers(*)))')
    .eq('driver_id', driverId)
    .eq('route_date', today)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateStopStatus(
  stopId: string,
  status: 'pending' | 'en_route' | 'in_progress' | 'completed' | 'cancelled',
  timestamps?: { started_at?: string; completed_at?: string }
) {
  const { error } = await supabase
    .from('stops')
    .update({ status, ...timestamps })
    .eq('id', stopId);
  if (error) throw error;
}

export async function updateJobStatus(
  jobId: string,
  status: string,
  timestamps?: { actual_start?: string; actual_end?: string }
) {
  const { error } = await supabase
    .from('jobs')
    .update({ status, ...timestamps })
    .eq('id', jobId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Jobs helpers
// ---------------------------------------------------------------------------

export async function getOrgJobs(orgId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, customers(*), drivers(name)')
    .eq('org_id', orgId)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createJob(job: {
  org_id: string;
  customer_id?: string;
  assigned_driver_id?: string;
  service_type: string;
  status?: string;
  priority: string;
  scheduled_at: string;
  estimated_duration: number;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...job, status: job.status ?? 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Notifications helpers
// ---------------------------------------------------------------------------

export async function getDriverNotifications(driverId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('driver_id', driverId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(driverId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('driver_id', driverId)
    .eq('read', false);
  if (error) throw error;
}
