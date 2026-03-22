import { supabase } from './supabase';
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'compliancesnap://auth/callback' } });
}
export async function signInWithApple() {
  return supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: 'compliancesnap://auth/callback' } });
}
export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'compliancesnap://auth/callback' } });
}
export async function signOut() { return supabase.auth.signOut(); }

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  return supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
}
export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: 'compliancesnap://auth/reset-password' });
}
