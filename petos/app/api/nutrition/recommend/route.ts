import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pet_id = searchParams.get('pet_id');
    if (!pet_id) {
      return NextResponse.json({ error: 'pet_id is required' }, { status: 400 });
    }

    // Fetch pet profile
    const { data: pet } = await supabase
      .from('pets')
      .select('name, species, breed, age_years, weight_kg, health_conditions, current_diet')
      .eq('id', pet_id)
      .eq('user_id', user.id)
      .single();

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
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
            'You are a veterinary nutrition AI. Provide personalized diet recommendations for pets based on their profile. Return JSON: { daily_calories, protein_pct, fat_pct, carb_pct, recommended_foods: [{name, type, benefits}], foods_to_avoid: [{name, reason}], meal_frequency, supplements: string[], notes: string }',
        },
        {
          role: 'user',
          content: `Pet profile: ${JSON.stringify(pet)}. Provide detailed nutrition recommendations.`,
        },
      ],
      max_tokens: 700,
      response_format: { type: 'json_object' },
    });

    const recommendations = JSON.parse(completion.choices[0].message.content ?? '{}');
    return NextResponse.json({ pet_id, pet_name: pet.name, recommendations });
  } catch (err) {
    console.error('[Nutrition Recommend]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Recommendation failed' },
      { status: 500 }
    );
  }
}
