import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PhotoAnalysisResult {
  condition_score: number;        // 1-9 Body Condition Score
  observations:    string[];      // Up to 5 visible observations
  recommendations: string[];      // Up to 3 actionable recommendations
  overall_health:  'excellent' | 'good' | 'fair' | 'concerning';
  weight_estimate: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await req.json() as {
      imageUrl?:    string;
      base64Image?: string;
      petId:        string;
      photoId?:     string;
      petContext?:  { species: string; breed: string | null };
    };

    const { imageUrl, base64Image, petId, photoId, petContext } = body;
    if (!imageUrl && !base64Image) {
      return NextResponse.json({ error: 'imageUrl or base64Image required' }, { status: 400 });
    }

    const imageContent = imageUrl
      ? { type: 'image_url' as const, image_url: { url: imageUrl } }
      : { type: 'image_url' as const, image_url: { url: `data:image/jpeg;base64,${base64Image}` } };

    const contextStr = petContext
      ? `This is a ${petContext.species}${petContext.breed ? ` (${petContext.breed})` : ''}.`
      : '';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a veterinary assistant specializing in pet health assessment from photos.
Analyze the photo and provide a JSON object with:
- condition_score: number 1-9 (BCS; 4-5 = ideal)
- observations: array of up to 5 specific visible observations about coat, body condition, posture, etc.
- recommendations: array of up to 3 actionable recommendations
- overall_health: "excellent" | "good" | "fair" | "concerning"
- weight_estimate: brief phrase like "appears healthy weight" or null
Always recommend consulting a vet for medical decisions.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Analyze this pet photo. ${contextStr} Provide a thorough health assessment.` },
            imageContent,
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: 'No AI response' }, { status: 500 });

    const analysis = JSON.parse(content) as PhotoAnalysisResult;

    // Persist analysis if photoId provided
    if (photoId) {
      await supabase
        .from('pet_photos')
        .update({ ai_analysis: analysis })
        .eq('id', photoId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ data: analysis });
  } catch (err) {
    console.error('Photo analysis error:', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
