'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Neighborhood, User } from '@/types/database'

export async function getNeighborhood(id: string): Promise<{ data?: Neighborhood; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { error: error.message }
  return { data: data as Neighborhood }
}

export async function getNeighborhoodMembers(
  neighborhoodId: string
): Promise<{ data?: User[]; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('neighborhood_id', neighborhoodId)
    .order('full_name', { ascending: true })

  if (error) return { error: error.message }
  return { data: data as User[] }
}

export async function createNeighborhood(input: {
  name: string
  description?: string
  address?: string
  city: string
  state: string
  zipCode?: string
}): Promise<{ data?: Neighborhood; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('neighborhoods')
    .insert({
      name: input.name,
      description: input.description ?? null,
      address: input.address ?? null,
      city: input.city,
      state: input.state,
      zip_code: input.zipCode ?? null,
      created_by: user.id,
      member_count: 1,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Assign user to this neighborhood
  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      neighborhood_id: data.id,
      role: 'admin',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (userUpdateError) return { error: userUpdateError.message }

  revalidatePath('/neighborhood')
  revalidatePath('/dashboard')
  return { data: data as Neighborhood }
}

export async function updateNeighborhood(
  id: string,
  updates: Partial<Pick<Neighborhood, 'name' | 'description' | 'address' | 'city' | 'state' | 'zip_code'>>
): Promise<{ data?: Neighborhood; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Only admin can update
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || !['admin', 'moderator'].includes(currentUser.role)) {
    return { error: 'Insufficient permissions' }
  }

  const { data, error } = await supabase
    .from('neighborhoods')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/neighborhood')
  return { data: data as Neighborhood }
}

export async function joinNeighborhood(
  neighborhoodId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({
      neighborhood_id: neighborhoodId,
      role: 'member',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  // Increment member count
  const { error: rpcError } = await supabase.rpc('increment_neighborhood_members', {
    p_neighborhood_id: neighborhoodId,
  })

  if (rpcError) return { error: rpcError.message }

  revalidatePath('/neighborhood')
  revalidatePath('/dashboard')
  return {}
}

export async function searchNeighborhoods(
  query: string
): Promise<{ data?: Neighborhood[]; error?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .or(`name.ilike.%${query}%,city.ilike.%${query}%,zip_code.ilike.%${query}%`)
    .limit(20)

  if (error) return { error: error.message }
  return { data: data as Neighborhood[] }
}

export async function updateUserRole(
  userId: string,
  role: 'admin' | 'moderator' | 'member'
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Only admin can change roles
  const { data: currentUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Only admins can change member roles' }
  }

  const { error } = await supabase
    .from('users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/neighborhood')
  return {}
}

export async function getCurrentUser(): Promise<{ data?: User; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { error: error.message }
  return { data: data as User }
}

export async function updateUserProfile(updates: {
  fullName?: string
  avatarUrl?: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({
      full_name: updates.fullName,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return {}
}
