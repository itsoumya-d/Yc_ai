const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface AIGuidance {
  title: string;
  steps: string[];
  warnings: string[];
  voiceSummary: string;
  confidence: number;
}

export async function analyzeJobScene(
  base64Image: string,
  trade: string,
  taskDescription?: string
): Promise<AIGuidance> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are FieldLens, an expert ${trade} coach. Analyze the job site image and provide clear, practical guidance. Keep voice summary under 30 words. Be specific about what you see.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this ${trade} job site image${taskDescription ? ` for task: ${taskDescription}` : ''}. Return JSON: { "title": "task name", "steps": ["step 1", "step 2", ...], "warnings": ["safety warning if any"], "voiceSummary": "30-word spoken summary", "confidence": 0.0-1.0 }`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    }),
  });
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{"title":"Analyzing...","steps":[],"warnings":[],"voiceSummary":"","confidence":0}');
}

export async function speakGuidance(text: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
    body: JSON.stringify({ text, model_id: 'eleven_monolingual_v1', voice_settings: { stability: 0.5, similarity_boost: 0.5 } }),
  });
  if (!response.ok) return null;
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
