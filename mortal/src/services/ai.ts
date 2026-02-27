const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function getWillDraftGuidance(prompt: string): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a compassionate estate planning assistant. Help users organize their final wishes clearly and thoughtfully. Always recommend consulting a lawyer for legal documents. Be warm and gentle in tone.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? 'Unable to generate guidance at this time.';
}

export async function generateFinalMessage(userNotes: string, recipientName: string): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are helping someone write a heartfelt final message to a loved one. Help shape their notes into a warm, personal letter. Keep their voice and key points intact.' },
        { role: 'user', content: `Help me write a final message to ${recipientName} based on these notes: ${userNotes}` }
      ],
      max_tokens: 600,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
