'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Product, Inventory, Category } from '@/types/database';
import { productSchema, inventorySchema } from '@/lib/validations/schemas';
import { escapeLikeWildcards } from '@/lib/utils';

export async function fetchProducts(options?: {
  category_id?: string;
  status?: string;
  search?: string;
}): Promise<ActionResult<Product[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('org_id', memberData.org_id)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (options?.category_id) {
      query = query.eq('category_id', options.category_id);
    }

    if (options?.search) {
      const escaped = escapeLikeWildcards(options.search);
      query = query.or(`name.ilike.%${escaped}%,sku.ilike.%${escaped}%,barcode.ilike.%${escaped}%`);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Product[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchProduct(id: string): Promise<ActionResult<Product>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Product };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function createProduct(formData: FormData): Promise<ActionResult<Product>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    const raw = {
      name: formData.get('name') as string,
      sku: (formData.get('sku') as string) || null,
      barcode: (formData.get('barcode') as string) || null,
      category_id: (formData.get('category_id') as string) || null,
      unit: (formData.get('unit') as string) || 'each',
      reorder_point: Number(formData.get('reorder_point') ?? 10),
      reorder_quantity: Number(formData.get('reorder_quantity') ?? 20),
      price_cents: formData.get('price_cents') ? Number(formData.get('price_cents')) : null,
      cost_cents: formData.get('cost_cents') ? Number(formData.get('cost_cents')) : null,
      description: (formData.get('description') as string) || null,
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('products')
      .insert({ org_id: memberData.org_id, ...parsed.data })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Product };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionResult<Product>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const raw = {
      name: formData.get('name') as string,
      sku: (formData.get('sku') as string) || null,
      barcode: (formData.get('barcode') as string) || null,
      category_id: (formData.get('category_id') as string) || null,
      unit: (formData.get('unit') as string) || 'each',
      reorder_point: Number(formData.get('reorder_point') ?? 10),
      reorder_quantity: Number(formData.get('reorder_quantity') ?? 20),
      price_cents: formData.get('price_cents') ? Number(formData.get('price_cents')) : null,
      cost_cents: formData.get('cost_cents') ? Number(formData.get('cost_cents')) : null,
      description: (formData.get('description') as string) || null,
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const { data, error } = await supabase
      .from('products')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: data as Product };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchInventory(productId?: string): Promise<ActionResult<Inventory[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    let query = supabase
      .from('inventory')
      .select('*, product:products(*), location:inventory_locations(*)')
      .eq('org_id', memberData.org_id)
      .order('updated_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;
    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Inventory[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchCategories(): Promise<ActionResult<Category[]>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: memberData } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!memberData) return { success: false, error: 'No organization found' };

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`org_id.eq.${memberData.org_id},is_default.eq.true`)
      .order('sort_order', { ascending: true });

    if (error) return { success: false, error: error.message };
    return { success: true, data: (data ?? []) as Category[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
