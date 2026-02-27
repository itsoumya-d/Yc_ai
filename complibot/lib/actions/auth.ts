'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { signUpSchema, signInSchema } from '@/lib/validations/schemas';
import type { ActionResult } from '@/types/database';

export async function signUp(formData: FormData): Promise<ActionResult<{ user: { id: string; email: string } | null }>> {
  try {
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      full_name: formData.get('full_name') as string,
      org_name: formData.get('org_name') as string | undefined,
    };

    const validated = signUpSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        data: {
          full_name: validated.data.full_name,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        user: data.user ? { id: data.user.id, email: data.user.email! } : null,
      },
    };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signIn(formData: FormData): Promise<ActionResult<void>> {
  try {
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validated = signInSchema.safeParse(raw);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0].message };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }

  redirect('/dashboard');
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {
    // Redirect regardless
  }

  redirect('/login');
}

export async function getUser(): Promise<ActionResult<{ id: string; email: string } | null>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data.user ? { id: data.user.id, email: data.user.email! } : null,
    };
  } catch (e) {
    return { success: false, error: 'An unexpected error occurred' };
  }
}
