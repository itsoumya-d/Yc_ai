import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ---- Auth helpers ----

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ---- Realtime subscription helper ----

export function subscribeToViolations(
  orgId: string,
  callback: (payload: unknown) => void,
) {
  return supabase
    .channel('violations-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'violations',
        filter: `org_id=eq.${orgId}`,
      },
      callback,
    )
    .subscribe();
}

// ---- Storage helper for inspection photos ----

export async function uploadInspectionPhoto(
  inspectionId: string,
  areaId: string,
  base64: string,
): Promise<string> {
  const filePath = `inspections/${inspectionId}/${areaId}.jpg`;
  const { error } = await supabase.storage
    .from('inspection-photos')
    .upload(filePath, decode(base64), {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (error) throw error;
  const { data } = supabase.storage
    .from('inspection-photos')
    .getPublicUrl(filePath);
  return data.publicUrl;
}

// base64 → Uint8Array decode helper
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
