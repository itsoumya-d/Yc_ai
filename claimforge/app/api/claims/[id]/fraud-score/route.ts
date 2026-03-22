import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch claim details
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a fraud detection AI for insurance claims. Analyze claim data for fraud risk indicators. Return JSON: { fraud_score: 0-100, risk_level: "low"|"medium"|"high"|"critical", risk_factors: [{factor, weight, description}], recommended_action: "approve"|"review"|"investigate"|"deny", confidence: 0-100, notes: string }',
        },
        {
          role: 'user',
          content: `Analyze this insurance claim for fraud indicators: ${JSON.stringify(claim)}`,
        },
      ],
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content ?? '{}');

    // Store fraud analysis result
    await supabase.from('claim_fraud_analyses').upsert({
      claim_id: id,
      user_id: user.id,
      fraud_score: analysis.fraud_score,
      risk_level: analysis.risk_level,
      analysis: analysis,
      analyzed_at: new Date().toISOString(),
    });

    // Update claim risk_level
    await supabase
      .from('claims')
      .update({ fraud_risk_level: analysis.risk_level, fraud_score: analysis.fraud_score })
      .eq('id', id);

    return NextResponse.json({ claim_id: id, ...analysis });
  } catch (err) {
    console.error('[Fraud Score]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fraud analysis failed' },
      { status: 500 }
    );
  }
}
