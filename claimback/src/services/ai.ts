const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface BillAnalysis {
  billType: string;
  totalAmount: number;
  potentialSavings: number;
  overcharges: Array<{ item: string; chargedAmount: number; expectedAmount: number; issue: string }>;
  disputePoints: string[];
  confidence: number;
}

export async function analyzeBill(base64Image: string): Promise<BillAnalysis> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this bill for overcharges, errors, and potential savings. Return JSON: { "billType": "medical|utility|subscription|insurance|other", "totalAmount": number, "potentialSavings": number, "overcharges": [{"item": "string", "chargedAmount": number, "expectedAmount": number, "issue": "string"}], "disputePoints": ["string"], "confidence": 0.0-1.0 }' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' } }
        ]
      }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    }),
  });
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{"billType":"other","totalAmount":0,"potentialSavings":0,"overcharges":[],"disputePoints":[],"confidence":0}');
}

export async function generateDisputeLetter(analysis: BillAnalysis, userName: string, accountNumber?: string): Promise<string> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a professional billing dispute specialist. Write formal, effective dispute letters.' },
        { role: 'user', content: `Write a dispute letter for ${userName}${accountNumber ? ` (Account: ${accountNumber})` : ''} regarding a ${analysis.billType} bill. Overcharges: ${JSON.stringify(analysis.overcharges)}. Dispute points: ${analysis.disputePoints.join('; ')}. Request a refund of $${analysis.potentialSavings}. Be professional and cite consumer protection laws.` }
      ],
      max_tokens: 600,
    }),
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function initiatePhoneDispute(phoneNumber: string, billInfo: BillAnalysis): Promise<{ callId: string }> {
  const apiKey = process.env.BLAND_AI_API_KEY;
  if (!apiKey) throw new Error('Bland.ai API key not configured');
  const response = await fetch('https://api.bland.ai/v1/calls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', authorization: apiKey },
    body: JSON.stringify({
      phone_number: phoneNumber,
      task: `You are calling to dispute a ${billInfo.billType} bill. The total overcharge is $${billInfo.potentialSavings}. Key issues: ${billInfo.disputePoints.join(', ')}. Be polite but firm. Request a credit or refund.`,
      model: 'enhanced',
      voice: 'mason',
    }),
  });
  const data = await response.json();
  return { callId: data.call_id };
}
