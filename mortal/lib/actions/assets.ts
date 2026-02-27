// Digital assets CRUD
import { supabase } from "../supabase";
import type { DigitalAsset } from "../../types";

export async function getAssets(): Promise<DigitalAsset[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("digital_assets")
    .select("*")
    .eq("user_id", user.id)
    .order("category");
  if (error) throw error;
  return data ?? [];
}

export async function createAsset(
  asset: Omit<DigitalAsset, "id" | "user_id" | "created_at" | "updated_at">
): Promise<DigitalAsset> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from("digital_assets")
    .insert({ ...asset, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAsset(id: string, updates: Partial<DigitalAsset>): Promise<DigitalAsset> {
  const { data, error } = await supabase
    .from("digital_assets")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAsset(id: string): Promise<void> {
  const { error } = await supabase.from("digital_assets").delete().eq("id", id);
  if (error) throw error;
}
