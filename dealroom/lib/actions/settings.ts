'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { ActionResult, Org, OrgMember, User } from '@/types/database';
import { orgSchema, inviteMemberSchema } from '@/lib/validations/schemas';

export interface OrgMemberWithUser extends OrgMember {
  user: User;
}

export async function fetchOrgSettings(): Promise<ActionResult<Org>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get org_id from org_members
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'No organization found' };
    }

    const { data, error } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', membership.org_id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Org };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateOrgSettings(formData: FormData): Promise<ActionResult<Org>> {
  try {
    const raw = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      timezone: formData.get('timezone') as string | null,
      currency: formData.get('currency') as string | null,
      fiscal_year_start: formData.get('fiscal_year_start')
        ? Number(formData.get('fiscal_year_start'))
        : null,
    };

    const parsed = orgSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get org_id from org_members
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'No organization found' };
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const { data, error } = await supabase
      .from('orgs')
      .update({
        name: parsed.data.name,
        slug: parsed.data.slug,
        timezone: parsed.data.timezone ?? undefined,
        currency: parsed.data.currency ?? undefined,
        fiscal_year_start: parsed.data.fiscal_year_start ?? undefined,
      })
      .eq('id', membership.org_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/settings');
    return { success: true, data: data as Org };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function fetchTeamMembers(): Promise<ActionResult<OrgMemberWithUser[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get org_id from org_members
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'No organization found' };
    }

    const { data, error } = await supabase
      .from('org_members')
      .select('*, user:users(*)')
      .eq('org_id', membership.org_id)
      .order('joined_at', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data ?? []) as unknown as OrgMemberWithUser[] };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function inviteMember(formData: FormData): Promise<ActionResult<OrgMember>> {
  try {
    const raw = {
      email: formData.get('email') as string,
      role: (formData.get('role') as string) || 'member',
    };

    const parsed = inviteMemberSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    // Get org_id and verify admin role
    const { data: membership, error: memberError } = await supabase
      .from('org_members')
      .select('org_id, role')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !membership) {
      return { success: false, error: 'No organization found' };
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return { success: false, error: 'Insufficient permissions to invite members' };
    }

    // Look up the user by email
    const { data: invitee, error: inviteeError } = await supabase
      .from('users')
      .select('id')
      .eq('email', parsed.data.email)
      .maybeSingle();

    if (inviteeError) {
      return { success: false, error: inviteeError.message };
    }

    if (!invitee) {
      return {
        success: false,
        error: 'No user found with that email address. They must sign up first.',
      };
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('org_members')
      .select('id')
      .eq('org_id', membership.org_id)
      .eq('user_id', invitee.id)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'User is already a member of this organization' };
    }

    // Insert org member
    const { data, error } = await supabase
      .from('org_members')
      .insert({
        org_id: membership.org_id,
        user_id: invitee.id,
        role: parsed.data.role,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/settings');
    return { success: true, data: data as OrgMember };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
