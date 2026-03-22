import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_base64, symptoms } = await request.json();
    if (!image_base64) {
      return NextResponse.json({ error: 'image_base64 is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 503 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a veterinary AI assistant. Analyze pet images and describe visible symptoms, coat/skin condition, posture, and any visible abnormalities. Always recommend consulting a licensed veterinarian for diagnosis. Return JSON with: { summary, conditions: [{name, likelihood, description}], urgency: "routine"|"soon"|"urgent"|"emergency", recommendations: string[] }',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${image_base64}`, detail: 'high' },
            },
            {
              type: 'text',
              text: symptoms ? `Additional symptoms reported: ${symptoms}` : 'Analyze this pet image for health indicators.',
            },
          ],
        },
      ],
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content ?? '{}');

    // Store analysis record
    await supabase.from('pet_analyses').insert({
      pet_id: params.id,
      user_id: user.id,
      image_url: null,
      analysis: result,
      urgency: result.urgency ?? 'routine',
    }).select().single();

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Pet Analyze Image]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
