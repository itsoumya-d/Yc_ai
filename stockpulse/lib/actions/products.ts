import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/index";

export async function getProducts(userId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .order("name");

  return { data: (data as Product[]) ?? [], error: error?.message };
}

export async function getProductByBarcode(barcode: string, userId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .eq("user_id", userId)
    .maybeSingle();

  return { data: data as Product | null, error: error?.message };
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">
) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  return { data: data as Product | null, error: error?.message };
}

export async function updateProduct(
  productId: string,
  updates: Partial<Product>
) {
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .single();

  return { data: data as Product | null, error: error?.message };
}

export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  return { error: error?.message };
}

export async function searchProducts(query: string, userId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`);

  return { data: (data as Product[]) ?? [], error: error?.message };
}
