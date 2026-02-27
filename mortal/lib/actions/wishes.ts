// Wishes CRUD with encryption
import { supabase } from "../supabase";
import type { WishesData, WishCategoryType } from "../../types";

export async function getWishes(): Promise<WishesData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function saveWishes(updates: Partial<WishesData>): Promise<WishesData> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from("wishes")
    .upsert({
      user_id: user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWishCompletion(
  category: WishCategoryType,
  completionPct: number
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const completionKey = `${category}_completion`;
  const { error } = await supabase
    .from("wishes")
    .upsert({
      user_id: user.id,
      [completionKey]: completionPct,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

  if (error) throw error;
}
