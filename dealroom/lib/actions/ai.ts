'use server';

import OpenAI from 'openai';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface DealScoreResult {
  score: number;
  rationale: string;
  riskFactors: string[];
  positiveFactors: string[];
  nextBestAction: string;
}

export async function scoreDeal(dealId: string): Promise<DealScoreResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: deal } = await supabase
    .from('deals')
    .select(`
      title, company, amount, close_date, probability, description,
      pipeline_stages!stage_id(name),
      activities(type, subject, content, ai_sentiment, occurred_at)
    `)
    .eq('id', dealId)
    .single();

  if (!deal) throw new Error('Deal not found');

  const daysToClose = deal.close_date
    ? Math.ceil((new Date(deal.close_date).getTime() - Date.now()) / 86400000)
    : null;

  const activitySummary = (deal.activities as Array<{ type: string; subject: string; ai_sentiment: string | null; occurred_at: string }>)
    ?.slice(0, 10)
    .map((a) => `[${a.type}] ${a.subject} (${a.ai_sentiment ?? 'unknown'} sentiment, ${new Date(a.occurred_at).toLocaleDateString()})`)
    .join('\n') ?? 'No activities recorded';

  const prompt = `Score this sales deal from 0-100 where 100 is the highest probability of closing successfully.

Deal: ${deal.title}
Company: ${deal.company}
Amount: $${deal.amount}
Stage: ${(deal.pipeline_stages as unknown as { name: string })?.name ?? 'Unknown'}
Days to close date: ${daysToClose ?? 'No date set'}
Internal probability: ${deal.probability}%
Description: ${deal.description ?? 'None'}

Recent activity (last 10):
${activitySummary}

Respond with a JSON object:
{
  "score": number (0-100),
  "rationale": "2-3 sentence explanation of the score",
  "riskFactors": ["risk 1", "risk 2"],
  "positiveFactors": ["positive 1", "positive 2"],
  "nextBestAction": "specific, actionable next step"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [
      { role: 'system', content: 'You are an expert sales coach analyzing deal health and win probability.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content ?? '{}') as DealScoreResult;

  const serviceClient = createServiceClient();
  await serviceClient.from('deals').update({
    ai_score: result.score,
    ai_score_rationale: `${result.rationale}\n\nNext: ${result.nextBestAction}`,
    ai_score_updated_at: new Date().toISOString(),
  }).eq('id', dealId);

  revalidatePath('/pipeline');
  revalidatePath(`/deals/${dealId}`);
  return result;
}

export async function analyzeEmailThread(dealId: string, emailContent: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content: 'You are a sales intelligence AI. Analyze email threads for sentiment, next steps, and risk signals.',
      },
      {
        role: 'user',
        content: `Analyze this email thread and respond with JSON:
{
  "summary": "2-3 sentence summary",
  "sentiment": "positive|neutral|negative|urgent",
  "nextSteps": ["step 1", "step 2"],
  "riskSignals": ["risk 1"],
  "keyInsights": "1-2 sentence key takeaway for the sales rep"
}

Email thread:
${emailContent}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const analysis = JSON.parse(response.choices[0].message.content ?? '{}');

  await supabase.from('activities').insert({
    deal_id: dealId,
    user_id: user.id,
    type: 'email_thread',
    subject: 'Email Thread Analysis',
    content: emailContent.slice(0, 2000),
    ai_summary: analysis.summary,
    ai_sentiment: analysis.sentiment,
    ai_next_steps: JSON.stringify(analysis.nextSteps),
    ai_risk_signals: JSON.stringify(analysis.riskSignals),
    occurred_at: new Date().toISOString(),
  });

  revalidatePath(`/deals/${dealId}`);
  return analysis;
}
