import { supabase } from "@/lib/supabase";
import OpenAI from "openai";
import type { ScanResultData, Product } from "@/types/index";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export async function scanBarcode(barcode: string): Promise<ScanResultData> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { found: false, barcode, error: "Not authenticated" };
  }

  // Look up product in database
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { found: false, barcode, error: error.message };
  }

  if (product) {
    return {
      found: true,
      barcode,
      product: product as Product,
      isLowStock:
        product.stock_quantity <= product.low_stock_threshold,
      isOutOfStock: product.stock_quantity === 0,
    };
  }

  // Product not found - try AI identification
  const aiProduct = await identifyBarcodeWithAI(barcode);

  return {
    found: false,
    barcode,
    aiSuggestion: aiProduct,
    message: "Product not found in your inventory. Would you like to add it?",
  };
}

async function identifyBarcodeWithAI(barcode: string): Promise<Partial<Product> | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Given the barcode "${barcode}", suggest what product this might be. Return a JSON object with: { "name": "product name", "category": "category", "description": "brief description" }. If you can't identify it, return null.`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    const result = JSON.parse(completion.choices[0].message.content ?? "null");
    return result;
  } catch {
    return null;
  }
}

export async function analyzeProductImage(
  imageBase64: string
): Promise<{ name?: string; category?: string; description?: string; confidence?: number } | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: 'Analyze this product image and identify it. Return JSON: { "name": "product name", "category": "category (Food/Electronics/Clothing/etc)", "description": "1 sentence description", "confidence": 0-1 }',
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: "low",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });

    return JSON.parse(completion.choices[0].message.content ?? "null");
  } catch {
    return null;
  }
}

export async function addProductFromScan(
  barcode: string,
  productData: {
    name: string;
    sku: string;
    category?: string;
    description?: string;
    stock_quantity?: number;
    low_stock_threshold?: number;
    cost_price?: number;
    retail_price?: number;
  }
): Promise<{ data?: Product; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      barcode,
      name: productData.name,
      sku: productData.sku,
      category: productData.category ?? null,
      description: productData.description ?? null,
      stock_quantity: productData.stock_quantity ?? 0,
      low_stock_threshold: productData.low_stock_threshold ?? 5,
      cost_price: productData.cost_price ?? null,
      retail_price: productData.retail_price ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Product };
}
