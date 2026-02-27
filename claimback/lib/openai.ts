const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export type BillType = 'medical' | 'utility' | 'telecom' | 'insurance' | 'subscription' | 'other';
export type OverchargeType = 'duplicate' | 'unexpected_fee' | 'billing_error' | 'unauthorized_charge' | 'price_discrepancy';
export type Severity = 'high' | 'medium' | 'low';

export interface LineItem {
  description: string;
  amount: number;
  quantity?: number;
  date?: string;
  code?: string;
}

export interface Overcharge {
  type: OverchargeType;
  severity: Severity;
  description: string;
  billedAmount: number;
  fairAmount: number;
  potentialSavings: number;
  confidence: number;
  lineItemIndex?: number;
}

export interface BillAnalysis {
  provider: string;
  billDate: string;
  totalAmount: number;
  lineItems: LineItem[];
  overcharges: Overcharge[];
  totalPotentialSavings: number;
  summary: string;
}

export async function analyzeBill(imageBase64: string, billType: BillType): Promise<BillAnalysis> {
  const systemPrompt = `You are an expert bill analyst specializing in detecting overcharges, billing errors, and fraudulent charges in ${billType} bills.
Analyze the bill image and extract all information. Flag any suspicious charges including:
- Duplicate charges (same service billed multiple times)
- Unexpected fees not previously disclosed
- Billing errors (incorrect rates, math errors)
- Unauthorized charges
- Price discrepancies (charged more than quoted/advertised)

Respond with a JSON object matching this schema:
{
  "provider": "string",
  "billDate": "YYYY-MM-DD",
  "totalAmount": number,
  "lineItems": [{"description": "string", "amount": number, "quantity": number, "date": "string", "code": "string"}],
  "overcharges": [{
    "type": "duplicate|unexpected_fee|billing_error|unauthorized_charge|price_discrepancy",
    "severity": "high|medium|low",
    "description": "string",
    "billedAmount": number,
    "fairAmount": number,
    "potentialSavings": number,
    "confidence": number (0-1),
    "lineItemIndex": number
  }],
  "totalPotentialSavings": number,
  "summary": "string"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' },
            },
            { type: 'text', text: `This is a ${billType} bill. Please analyze it for overcharges and billing errors.` },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content) as BillAnalysis;
}

export async function generateDisputeLetter(
  analysis: BillAnalysis,
  billType: BillType,
  userName: string,
): Promise<string> {
  const overchargesList = analysis.overcharges
    .map((o, i) => `${i + 1}. ${o.description} (Billed: $${o.billedAmount.toFixed(2)}, Fair: $${o.fairAmount.toFixed(2)}, Savings: $${o.potentialSavings.toFixed(2)})`)
    .join('\n');

  const prompt = `Write a professional dispute letter for the following ${billType} billing errors.
The letter should be firm but polite, clearly state each disputed charge, reference consumer protection laws where applicable, and request a specific resolution.

Billed by: ${analysis.provider}
Bill date: ${analysis.billDate}
Total billed: $${analysis.totalAmount.toFixed(2)}
Total disputed: $${analysis.totalPotentialSavings.toFixed(2)}

Disputed charges:
${overchargesList}

Write the letter from ${userName}. Include today's date. Request a written response within 30 days. Keep it under 400 words.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 1000,
      messages: [
        { role: 'system', content: 'You are an expert consumer advocate who writes effective billing dispute letters.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}
