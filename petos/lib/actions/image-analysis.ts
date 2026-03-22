'use server';

import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PetSymptomAnalysis {
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  possibleConditions: Array<{
    name: string;
    likelihood: 'low' | 'medium' | 'high';
    description: string;
  }>;
  recommendations: string[];
  vetUrgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  homeCareTips: string[];
  warningSign: boolean;
  warningMessage?: string;
}

export async function analyzePetImage(
  imageUrl: string,
  petId: string,
  petSpecies: string,
  petBreed: string,
  petAge: number,
  ownerNotes: string
): Promise<{ success: boolean; data?: PetSymptomAnalysis; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // Download from Supabase Storage
    const { data: fileData } = await supabase.storage
      .from('pet-photos')
      .download(imageUrl);

    if (!fileData) return { success: false, error: 'Could not load image' };

    const buffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a veterinary AI assistant. Analyze pet photos for visible symptoms, injuries, or health concerns.

IMPORTANT DISCLAIMERS: Always recommend consulting a licensed veterinarian. Never provide a definitive diagnosis. Focus on observable symptoms only.

Return JSON with severity levels and vet urgency recommendations.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this photo of a ${petAge}-year-old ${petBreed} ${petSpecies}.
Owner notes: "${ownerNotes || 'None provided'}"

Return JSON:
{
  "symptoms": ["list of visible symptoms or observations"],
  "severity": "mild|moderate|severe|emergency",
  "possibleConditions": [
    {
      "name": "Condition name",
      "likelihood": "low|medium|high",
      "description": "Brief description"
    }
  ],
  "recommendations": ["action items for the owner"],
  "vetUrgency": "routine|soon|urgent|emergency",
  "homeCareTips": ["safe home care tips if severity is mild"],
  "warningSign": false,
  "warningMessage": null
}

Always end recommendations with: "Please consult your veterinarian for professional diagnosis and treatment."`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2048,
    });

    const analysis = JSON.parse(response.choices[0].message.content ?? '{}') as PetSymptomAnalysis;

    // Save analysis to health records
    await supabase.from('health_records').insert({
      pet_id: petId,
      type: 'checkup',
      title: 'AI Image Analysis',
      description: `AI symptom check — severity: ${analysis.severity}. ${analysis.symptoms.slice(0, 3).join(', ')}`,
      date: new Date().toISOString().split('T')[0],
      notes: ownerNotes || null,
    });

    return { success: true, data: analysis };
  } catch {
    return { success: false, error: 'Image analysis failed. Please try again.' };
  }
}
