import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/actions/transactional-emails';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Fire welcome email only on first sign-in (created_at ≈ last_sign_in_at)
      const user = data.user;
      const isNewUser = user.created_at && user.last_sign_in_at &&
        Math.abs(new Date(user.created_at).getTime() - new Date(user.last_sign_in_at).getTime()) < 10_000;
      if (isNewUser) {
        const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there';
        sendWelcomeEmail(user.email!, name).catch(console.error);
        // Enqueue drip email sequence (day 1, 3, 7, 14)
        supabase.rpc('enqueue_drip_sequence', {
          p_user_id: user.id,
          p_email: user.email!,
          p_name: name,
        }).then(({ error }) => { if (error) console.error('[drip] enqueue error:', error.message); });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
