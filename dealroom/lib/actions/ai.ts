'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import OpenAI from 'openai';
import type { AIPrediction, DealHealth } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function analyzeDeal(dealId: string): Promise<ActionResult<AIPrediction>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    // Fetch deal
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .eq('user_id', user.id)
      .single();

    if (dealError || !deal) return { error: dealError?.message ?? 'Deal not found' };

    // Fetch recent activities
    const { data: activities } = await supabase
      .from('deal_activities')
      .select('*')
      .eq('deal_id', dealId)
      .order('occurred_at', { ascending: false })
      .limit(10);

    // Build prompt context
    const today = new Date().toISOString().split('T')[0];
    const daysSinceUpdate = deal.updated_at
      ? Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / 86400000)
      : 0;

    const activitiesSummary = activities && activities.length > 0
      ? activities.map((a: { activity_type: string; title: string; body: string; occurred_at: string }) =>
          `- [${a.activity_type.toUpperCase()}] ${a.title}: ${a.body?.slice(0, 100) || '(no body)'} (${a.occurred_at.split('T')[0]})`
        ).join('\n')
      : 'No activities recorded yet.';

    const prompt = `You are a B2B sales intelligence AI. Analyze this deal and provide a JSON assessment.

DEAL DATA:
Company: ${deal.company_name}
Contact: ${deal.contact_name} (${deal.contact_email})
Stage: ${deal.stage}
Amount: ${deal.currency} ${deal.amount}
Close Date: ${deal.close_date ?? 'Not set'}
Today: ${today}
Days Since Last Update: ${daysSinceUpdate}
Description: ${deal.description || 'None'}
Current Next Action: ${deal.next_action ?? 'None'}

RECENT ACTIVITIES (last 10):
${activitiesSummary}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{
  "close_probability": <number 0-100>,
  "deal_health": <"healthy" | "at_risk" | "critical" | "stalled">,
  "risk_factors": [<up to 4 concise risk factor strings>],
  "next_actions": [<up to 4 concise recommended action strings>],
  "analysis_summary": "<2-3 sentence summary of deal status and outlook>"
}

Guidelines:
- close_probability: realistic estimate based on stage, activity, and signals
- deal_health: healthy (on track), at_risk (some red flags), critical (serious issues), stalled (no momentum)
- risk_factors: specific issues identified (e.g. "No activity in 14 days", "Close date passed", "No budget confirmed")
- next_actions: specific next steps (e.g. "Send pricing proposal by Friday", "Schedule executive sponsor meeting")`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    });

    const rawContent = completion.choices[0]?.message?.content ?? '{}';

    let parsed: {
      close_probability: number;
      deal_health: DealHealth;
      risk_factors: string[];
      next_actions: string[];
      analysis_summary: string;
    };

    try {
      parsed = JSON.parse(rawContent);
    } catch {
      // Attempt to extract JSON from markdown code blocks
      const match = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        return { error: 'AI returned invalid JSON response' };
      }
    }

    // Validate fields
    const closeProbability = Math.max(0, Math.min(100, Number(parsed.close_probability) || 0));
    const dealHealth: DealHealth = (['healthy', 'at_risk', 'critical', 'stalled'] as DealHealth[]).includes(parsed.deal_health)
      ? parsed.deal_health
      : 'healthy';
    const riskFactors = Array.isArray(parsed.risk_factors) ? parsed.risk_factors.slice(0, 4) : [];
    const nextActions = Array.isArray(parsed.next_actions) ? parsed.next_actions.slice(0, 4) : [];
    const analysisSummary = typeof parsed.analysis_summary === 'string' ? parsed.analysis_summary : '';

    // Save prediction to DB
    const { data: prediction, error: predError } = await supabase
      .from('ai_predictions')
      .insert({
        deal_id: dealId,
        close_probability: closeProbability,
        risk_factors: riskFactors,
        next_actions: nextActions,
        deal_health: dealHealth,
        analysis_summary: analysisSummary,
      })
      .select()
      .single();

    if (predError) return { error: predError.message };

    // Update deal with new AI score and health
    await supabase
      .from('deals')
      .update({
        ai_score: closeProbability,
        health_status: dealHealth,
        probability: closeProbability,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dealId)
      .eq('user_id', user.id);

    revalidatePath(`/deals/${dealId}`);
    revalidatePath('/deals');
    revalidatePath('/dashboard');

    return { data: prediction as AIPrediction };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error during AI analysis' };
  }
}

export async function generateFollowUpEmail(dealId: string): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .eq('user_id', user.id)
      .single();

    if (dealError || !deal) return { error: dealError?.message ?? 'Deal not found' };

    // Get latest prediction for context
    const { data: prediction } = await supabase
      .from('ai_predictions')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const nextActions = prediction?.next_actions?.join(', ') ?? 'schedule next steps';

    const prompt = `Write a professional, concise B2B follow-up email for this deal:

Company: ${deal.company_name}
Contact: ${deal.contact_name}
Stage: ${deal.stage}
Amount: ${deal.currency} ${deal.amount}
Next Steps: ${nextActions}

Write a short, personalized follow-up email (3-4 sentences) that advances the deal. Use a professional but warm tone. Include a clear call to action. Output ONLY the email body text, no subject line, no signature.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const emailBody = completion.choices[0]?.message?.content?.trim() ?? '';
    return { data: emailBody };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
