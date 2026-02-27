'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Resource, ResourceStatus } from '@/types/database'

export async function getResources(neighborhoodId?: string): Promise<{ data?: Resource[]; error?: string }> {
  const supabase = await createClient()

  let query = supabase
    .from('resources')
    .select(`
      *,
      owner:users!resources_owner_id_fkey(id, full_name, avatar_url, email)
    `)
    .order('created_at', { ascending: false })

  if (neighborhoodId) {
    query = query.eq('neighborhood_id', neighborhoodId)
  }

  const { data, error } = await query

  if (error) return { error: error.message }
  return { data: data as Resource[] }
}

export async function getResource(id: string): Promise<{ data?: Resource; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      owner:users!resources_owner_id_fkey(id, full_name, avatar_url, email)
    `)
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data: data as Resource }
}

export async function createResource(input: {
  name: string
  description?: string
  category: string
  neighborhoodId: string
  imageUrl?: string
}): Promise<{ data?: Resource; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      name: input.name,
      description: input.description ?? null,
      category: input.category,
      neighborhood_id: input.neighborhoodId,
      owner_id: user.id,
      status: 'available',
      image_url: input.imageUrl ?? null,
    })
    .select(`
      *,
      owner:users!resources_owner_id_fkey(id, full_name, avatar_url, email)
    `)
    .single()

  if (error) return { error: error.message }

  revalidatePath('/resources')
  return { data: data as Resource }
}

export async function updateResourceStatus(
  id: string,
  status: ResourceStatus
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'borrowed') {
    updates.borrower_id = user.id
  } else if (status === 'available') {
    updates.borrower_id = null
  }

  const { error } = await supabase
    .from('resources')
    .update(updates)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/resources')
  return {}
}

export async function deleteResource(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('resources')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/resources')
  return {}
}

export async function borrowResource(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check current status
  const { data: resource, error: fetchError } = await supabase
    .from('resources')
    .select('status, owner_id')
    .eq('id', id)
    .single()

  if (fetchError) return { error: fetchError.message }
  if (resource.status !== 'available') return { error: 'Resource is not available' }
  if (resource.owner_id === user.id) return { error: 'You cannot borrow your own resource' }

  const { error } = await supabase
    .from('resources')
    .update({
      status: 'borrowed',
      borrower_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/resources')
  return {}
}

export async function returnResource(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('resources')
    .update({
      status: 'available',
      borrower_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('borrower_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/resources')
  return {}
}
