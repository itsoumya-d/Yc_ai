import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/index";

export type StockAction = "add" | "remove" | "set";

export async function updateStockLevel(
  productId: string,
  action: StockAction,
  quantity: number,
  userId: string,
  note?: string
) {
  // Get current product
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("stock_quantity, barcode")
    .eq("id", productId)
    .single();

  if (fetchError || !product) {
    return { error: "Product not found" };
  }

  const previousQuantity = product.stock_quantity;
  let newQuantity: number;

  if (action === "add") {
    newQuantity = previousQuantity + quantity;
  } else if (action === "remove") {
    newQuantity = Math.max(0, previousQuantity - quantity);
  } else {
    newQuantity = quantity;
  }

  // Update product quantity
  const { error: updateError } = await supabase
    .from("products")
    .update({
      stock_quantity: newQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Log the scan/movement
  await supabase.from("scan_logs").insert({
    user_id: userId,
    product_id: productId,
    barcode: product.barcode,
    action,
    quantity_change:
      action === "add" ? quantity : action === "remove" ? -quantity : quantity,
    previous_quantity: previousQuantity,
    new_quantity: newQuantity,
    note: note ?? null,
  });

  return { data: { previousQuantity, newQuantity }, error: null };
}

export async function bulkUpdateStock(
  updates: Array<{ productId: string; quantity: number }>,
  userId: string
) {
  const results = [];
  for (const update of updates) {
    const result = await updateStockLevel(
      update.productId,
      "set",
      update.quantity,
      userId
    );
    results.push(result);
  }
  return results;
}

export async function getStockHistory(productId: string, limit = 20) {
  const { data, error } = await supabase
    .from("scan_logs")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return { data: data ?? [], error: error?.message };
}

export async function getLowStockProducts(userId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId)
    .lte("stock_quantity", supabase.rpc("get_low_stock_threshold") as unknown as number);

  // Fallback: manual filter
  const { data: allProducts } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", userId);

  const lowStock = (allProducts ?? []).filter(
    (p: Product) => p.stock_quantity <= p.low_stock_threshold
  );

  return { data: lowStock as Product[], error: null };
}
