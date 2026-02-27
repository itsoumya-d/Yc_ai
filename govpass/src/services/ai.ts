const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function extractDocumentData(
  base64Image: string,
  documentType: string
): Promise<{ fields: Record<string, { value: string; confidence: number }>; issues: string[] }> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract all visible data from this ${documentType} document. Return JSON with: { "fields": { "fieldName": { "value": "...", "confidence": 0.0-1.0 } }, "issues": [] }`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    }),
  });
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(content);
}

export async function getFormGuidance(
  program: string,
  step: string,
  language: 'en' | 'es' = 'en'
): Promise<{ guidance: string; tips: string[] }> {
  const langInstruction = language === 'es' ? 'Respond entirely in Spanish.' : '';
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are GovPass, a friendly government benefits assistant. Use simple, plain language (6th grade reading level). ${langInstruction}`,
        },
        {
          role: 'user',
          content: `Explain step "${step}" of the ${program} application. Return JSON: { "guidance": "...", "tips": ["..."] }`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    }),
  });
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '{}';
  return JSON.parse(content);
}
