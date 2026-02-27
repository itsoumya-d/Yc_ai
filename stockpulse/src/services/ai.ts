import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ProductIdentification {
  name: string;
  category: string;
  brand?: string;
  description: string;
  suggestedSku: string;
  unit: 'each' | 'kg' | 'lbs' | 'case' | 'box' | 'bottle' | 'can';
  estimatedCost?: number;
  confidence: number; // 0-1
}

/**
 * Uses GPT-4o Vision to identify a product from a base64-encoded JPEG image.
 * Returns structured product data for inventory management.
 */
export async function identifyProduct(base64Image: string): Promise<ProductIdentification> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Identify this product for inventory management. Return JSON with:
- name: product name
- category: product category (e.g., "Beverages", "Produce", "Dry Goods", "Cleaning", "Dairy", "Meat")
- brand: brand name if visible
- description: brief product description (1-2 sentences)
- suggestedSku: suggested SKU code (alphanumeric, 6-10 chars, uppercase)
- unit: unit of measure — one of: each | kg | lbs | case | box | bottle | can
- estimatedCost: estimated unit cost in USD as a number (null if unknown)
- confidence: float 0.0-1.0 representing confidence in identification

Return ONLY valid JSON, no markdown.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 400,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content ?? '{}';

  try {
    const parsed = JSON.parse(raw) as ProductIdentification;
    // Ensure required fields have fallback values
    return {
      name: parsed.name ?? 'Unknown Product',
      category: parsed.category ?? 'Other',
      brand: parsed.brand,
      description: parsed.description ?? '',
      suggestedSku: parsed.suggestedSku ?? 'SKU000',
      unit: parsed.unit ?? 'each',
      estimatedCost: parsed.estimatedCost ?? undefined,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch {
    throw new Error('Failed to parse AI product identification response');
  }
}

export interface LowStockItem {
  name: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  supplierName?: string;
}

/**
 * Generates a professional purchase order document using GPT-4o-mini.
 * Returns a formatted plain-text purchase order string.
 */
export async function generatePurchaseOrder(
  lowStockItems: LowStockItem[],
  locationName: string
): Promise<string> {
  if (lowStockItems.length === 0) {
    return 'No low-stock items to order.';
  }

  const itemsList = lowStockItems
    .map(
      (item) =>
        `- ${item.name} (SKU: ${item.sku}): current ${item.currentStock}, reorder at ${item.reorderPoint}${
          item.supplierName ? `, supplier: ${item.supplierName}` : ''
        }`
    )
    .join('\n');

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Generate a professional purchase order for ${locationName} dated ${today}.

Low Stock Items:
${itemsList}

Requirements:
1. Suggest order quantities (typically 2-4 weeks of stock based on the reorder point)
2. Format as a clear purchase order with:
   - PO header (PO number, date, location)
   - Line items table (Item #, SKU, Product Name, Qty to Order, Unit)
   - Total line count
   - Notes section with any relevant purchasing advice
3. Keep it concise and professional (max 400 words)`,
      },
    ],
    max_tokens: 600,
  });

  return response.choices[0]?.message?.content ?? 'Unable to generate purchase order.';
}
