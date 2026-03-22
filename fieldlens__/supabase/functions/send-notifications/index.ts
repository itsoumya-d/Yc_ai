/**
 * send-notifications — Expo Push Notification sender for Fieldlens
 *
 * POST body options:
 *   { userId?: string, type: string, data?: Record<string,string> }  — standard
 *   { userId: string, type: 'lifecycle', day: number }               — lifecycle sequence
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BRAND = 'Fieldlens';

interface NotificationTemplate {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
}

// ─── D1–D30 Lifecycle Templates ───────────────────────────────────────────────
const LIFECYCLE_TEMPLATES: Record<string, NotificationTemplate> = {
  d1_welcome: {
    title: 'Start your first coaching session 🔧',
    body: 'Point your camera at your work and get real-time AI feedback. Electricians love the wiring checks.',
    data: { type: 'lifecycle', day: 1, screen: '/(tabs)/coach', action: 'start' },
    sound: 'default',
  },
  d3_reengagement: {
    title: 'Ready for another session?',
    body: 'Tradespeople who use AI coaching 3x/week improve 40% faster. Your coach is waiting.',
    data: { type: 'lifecycle', day: 3, screen: '/(tabs)/coach' },
    sound: 'default',
  },
  d7_achievement: {
    title: '⚡ 1-week skills report',
    body: "You've completed [X] sessions. Your AI coach rates your progress: [X]/10. Keep going.",
    data: { type: 'lifecycle', day: 7, screen: '/(tabs)/progress' },
    sound: 'default',
  },
  d14_upgrade: {
    title: 'Unlock unlimited coaching',
    body: 'Pro gives you unlimited AI sessions, voice coaching, and skill certifications for $29.99/mo.',
    data: { type: 'lifecycle', day: 14, screen: '/(auth)/paywall' },
    sound: 'default',
    badge: 1,
  },
  d21_feature_discovery: {
    title: 'Tip of the day 💡',
    body: 'Did you know? Using Fieldlens before starting a new task reduces mistakes by 60%. Try it now.',
    data: { type: 'lifecycle', day: 21, screen: '/(tabs)/coach', action: 'pre-task' },
    sound: 'default',
  },
  d30_winback: {
    title: 'March skills summary 🏆',
    body: '[X] sessions completed. [X] skills improved. You\'re in the top [X]% of [trade] professionals.',
    data: { type: 'lifecycle', day: 30, screen: '/(tabs)/progress' },
    sound: 'default',
  },
};

// ─── App-Specific Notification Templates ──────────────────────────────────────
const NOTIFICATIONS: Record<string, (d?: Record<string, string>) => NotificationTemplate> = {
  'coaching-reminder': (d) => ({
    title: `${BRAND}: Session reminder`,
    body: d?.trade ? `Time for your ${d.trade} coaching session. Your AI coach is ready.` : 'Your AI coaching session is ready to start.',
    data: { screen: '/(tabs)/coach', ...d },
    sound: 'default',
  }),
  'skill-unlocked': (d) => ({
    title: `${BRAND}: New skill unlocked!`,
    body: d?.skill ? `You've mastered "${d.skill}". Tap to claim your certificate.` : 'You unlocked a new skill. Tap to see your achievement.',
    data: { screen: '/(tabs)/progress', action: 'skill-unlocked', ...d },
    sound: 'default',
    badge: 1,
  }),
  'job-tip': (d) => ({
    title: `${BRAND}: Pro tip`,
    body: d?.tip ?? 'Your AI coach has a new tip for your trade. Tap to see it.',
    data: { screen: '/(tabs)/tips', ...d },
    sound: 'default',
  }),
  'session-complete': (d) => ({
    title: `${BRAND}: Session complete`,
    body: d?.score ? `Session score: ${d.score}/10. ${d.feedback ?? 'Great work!'}` : 'Your coaching session has been saved.',
    data: { screen: '/(tabs)/progress', ...d },
    sound: 'default',
  }),
  'subscription-expiring': (d) => ({
    title: `${BRAND}: Subscription expiring`,
    body: 'Your Fieldlens Pro subscription expires in 3 days. Renew to keep your AI coaching.',
    data: { screen: '/(auth)/paywall', ...d },
    sound: 'default',
  }),
};

async function sendExpoPush(pushToken: string, n: NotificationTemplate) {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ to: pushToken, title: n.title, body: n.body, data: n.data ?? {}, sound: n.sound ?? 'default', badge: n.badge }),
  });
  const json = await res.json();
  const result = json.data ?? json;
  return { status: result.status ?? 'error', id: result.id, error: result.message };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 }); }

  const userId = body.userId as string | undefined;
  const type = body.type as string;
  const day = body.day as number | undefined;
  const extraData = body.data as Record<string, string> | undefined;

  // ── Lifecycle notification routing ──────────────────────────────────────────
  if (type === 'lifecycle') {
    const dayKey = `d${day}_${
      day === 1 ? 'welcome' :
      day === 3 ? 'reengagement' :
      day === 7 ? 'achievement' :
      day === 14 ? 'upgrade' :
      day === 21 ? 'feature_discovery' :
      day === 30 ? 'winback' : ''
    }`;
    const template = LIFECYCLE_TEMPLATES[dayKey];
    if (!template) return new Response(JSON.stringify({ error: `No lifecycle template for day ${day}` }), { status: 400 });

    let lcTokens: { push_token: string }[] = [];
    if (userId) {
      const { data } = await supabase.from('profiles').select('expo_push_token').eq('id', userId).not('expo_push_token', 'is', null).single();
      if (data?.expo_push_token) lcTokens = [{ push_token: data.expo_push_token }];
    } else {
      const { data } = await supabase.from('profiles').select('expo_push_token').not('expo_push_token', 'is', null);
      if (data) lcTokens = data.filter((p: { expo_push_token: string | null }) => p.expo_push_token).map((p: { expo_push_token: string }) => ({ push_token: p.expo_push_token }));
    }

    if (lcTokens.length === 0) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    const lcResults = await Promise.allSettled(lcTokens.map(({ push_token }) => sendExpoPush(push_token, template)));
    const lcSent = lcResults.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<{ status: string }>).value.status === 'ok').length;
    console.log(`[fieldlens:send-notifications] lifecycle day=${day} sent=${lcSent} failed=${lcResults.length - lcSent}`);
    return new Response(JSON.stringify({ sent: lcSent, failed: lcResults.length - lcSent, total: lcResults.length }), { status: 200 });
  }

  // ── Standard notification routing ───────────────────────────────────────────
  const templateFn = NOTIFICATIONS[type];
  if (!templateFn) return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), { status: 400 });
  const notification = templateFn(extraData);

  let tokens: { push_token: string }[] = [];
  if (userId) {
    const { data } = await supabase.from('profiles').select('expo_push_token').eq('id', userId).not('expo_push_token', 'is', null).single();
    if (data?.expo_push_token) tokens = [{ push_token: data.expo_push_token }];
  } else {
    const { data } = await supabase.from('profiles').select('expo_push_token').not('expo_push_token', 'is', null);
    if (data) tokens = data.filter((p: { expo_push_token: string | null }) => p.expo_push_token).map((p: { expo_push_token: string }) => ({ push_token: p.expo_push_token }));
  }

  if (tokens.length === 0) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  const results = await Promise.allSettled(tokens.map(({ push_token }) => sendExpoPush(push_token, notification)));
  const sent = results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<{ status: string }>).value.status === 'ok').length;
  console.log(`[fieldlens:send-notifications] type=${type} sent=${sent} failed=${results.length - sent}`);
  return new Response(JSON.stringify({ sent, failed: results.length - sent, total: results.length }), { status: 200 });
});
