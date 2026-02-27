// Trusted contacts CRUD
import { supabase } from "../supabase";
import type { TrustedContact } from "../../types";

export async function getContacts(): Promise<TrustedContact[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("trusted_contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("role");
  if (error) throw error;
  return data ?? [];
}

export async function createContact(
  contact: Omit<TrustedContact, "id" | "user_id" | "created_at">
): Promise<TrustedContact> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from("trusted_contacts")
    .insert({ ...contact, user_id: user.id, verified: false })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateContact(id: string, updates: Partial<TrustedContact>): Promise<TrustedContact> {
  const { data, error } = await supabase
    .from("trusted_contacts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteContact(id: string): Promise<void> {
  const { error } = await supabase.from("trusted_contacts").delete().eq("id", id);
  if (error) throw error;
}
