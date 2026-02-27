import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface SceneAnalysis {
  progressSummary: string;
  workCompleted: string[];
  safetyViolations: SafetyViolation[];
  weatherConditions: string;
  crewActivity: string;
  overallProgress: number; // 0-100
  recommendations: string[];
}

export interface SafetyViolation {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  oshaReference: string;
  description: string;
  correctionRequired: string;
}

export async function analyzeConstructionScene(
  base64Image: string,
  siteContext?: string
): Promise<SceneAnalysis> {
  const prompt = `You are a construction site safety and progress analyst with expertise in OSHA standards.

Analyze this construction site photo and provide a JSON response with:
- progressSummary: 1-2 sentence summary of what's happening
- workCompleted: array of specific work activities visible
- safetyViolations: array of OSHA safety violations detected (empty array if none)
  Each violation: { type, severity (low/medium/high/critical), oshaReference, description, correctionRequired }
- weatherConditions: observed weather/site conditions
- crewActivity: description of crew activity and count if visible
- overallProgress: estimated completion percentage for visible work (0-100)
- recommendations: array of actionable recommendations

Site context: ${siteContext ?? 'General construction site'}

Return ONLY valid JSON.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(text) as SceneAnalysis;
}

export async function generateDailyReport(
  photos: Array<{ analysis: SceneAnalysis; location: string; timestamp: string }>,
  siteName: string
): Promise<string> {
  const summaries = photos
    .map(
      (p, i) =>
        `Photo ${i + 1} (${p.location}, ${p.timestamp}): ${p.analysis.progressSummary}. Safety violations: ${p.analysis.safetyViolations.length}`
    )
    .join('\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: `Generate a professional daily construction progress report for ${siteName} based on these photo analyses:\n\n${summaries}\n\nFormat as a clear, professional report with sections: Overview, Work Completed, Safety Status, Recommendations. Keep it concise but thorough.`,
      },
    ],
    max_tokens: 800,
  });

  return response.choices[0]?.message?.content ?? 'Report generation failed.';
}

export async function uploadPhotoToSupabase(
  photoUri: string,
  siteId: string,
  photoId: string
): Promise<string> {
  const { supabase } = await import('./supabase');

  const response = await fetch(photoUri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const filePath = `sites/${siteId}/photos/${photoId}.jpg`;

  const { data, error } = await supabase.storage
    .from('site-photos')
    .upload(filePath, uint8Array, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from('site-photos')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}
