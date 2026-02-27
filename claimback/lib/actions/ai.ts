import { openai, BILL_ANALYSIS_SYSTEM_PROMPT, DISPUTE_LETTER_SYSTEM_PROMPT } from '../openai';
import type { BillAnalysisResult, BillType } from '../../types';

const BILL_TYPE_CONTEXT: Record<BillType, string> = {
  medical: 'Focus on CPT codes, compare to Medicare rates, flag upcoding, unbundling, duplicate charges, and balance billing violations.',
  bank: 'Check for unauthorized fees, excessive overdraft charges, fees violating account agreement, CFPB Reg E violations.',
  utility: 'Verify rate schedule accuracy, check for meter reading errors, identify unauthorized rate changes.',
  telecom: 'Check for cramming (unauthorized charges), slamming, data throttling fees, contract violation penalties.',
  insurance: 'Verify claim processing accuracy, check for improper denials, coordination of benefits errors.',
  other: 'Identify any charges that appear duplicated, unauthorized, or above market rates.',
};

export async function analyzeBillImage(
  imageBase64: string,
  billType: BillType
): Promise<BillAnalysisResult> {
  const context = BILL_TYPE_CONTEXT[billType];
  const analysisPrompt = `Analyze this ${billType} bill image carefully.\n${context}\n\nReturn ONLY valid JSON with this exact structure:\n${JSON.stringify({
    provider_name: 'string',
    bill_date: 'YYYY-MM-DD or null',
    due_date: 'YYYY-MM-DD or null',
    total_amount: 0,
    bill_type: billType,
    line_items: [{ description: 'string', code: null, quantity: 1, billed_amount: 0, fair_amount: null, is_overcharge: false, overcharge_reason: null }],
    total_overcharge: 0,
    overcharge_flags: [],
    confidence: 0.9,
  }, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: BILL_ANALYSIS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' },
          },
          { type: 'text', text: analysisPrompt },
        ],
      },
    ],
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI analysis');
  return JSON.parse(content) as BillAnalysisResult;
}

export async function generateDisputeLetter(
  analysis: BillAnalysisResult
): Promise<string> {
  const LEGAL_REFS: Record<BillType, string> = {
    medical: 'No Surprises Act, HIPAA billing regulations, state surprise billing laws, Medicare reasonable rates',
    bank: 'Electronic Fund Transfer Act (Reg E), Truth in Savings Act, CFPB Circular 2022-06 on junk fees',
    utility: 'State public utility commission regulations, tariff schedules, consumer protection statutes',
    telecom: 'FCC regulations, Truth in Billing rules (47 CFR Part 64), state PUC rules',
    insurance: 'No Surprises Act, state insurance regulations, ERISA for employer plans',
    other: 'State consumer protection laws, FTC Act Section 5, applicable industry regulations',
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const legalRefs = LEGAL_REFS[analysis.bill_type as BillType] || LEGAL_REFS.other;
  const overchargeDetails = analysis.line_items
    .filter(item => item.is_overcharge)
    .map(item => `${item.description}: billed $${item.billed_amount}, fair price $${item.fair_amount || 0} (${item.overcharge_reason || 'overcharge'})`)
    .join('; ');

  const prompt = `Generate a formal dispute letter for the following billing dispute:
Provider: ${analysis.provider_name}
Bill Type: ${analysis.bill_type}
Bill Date: ${analysis.bill_date || 'Unknown'}
Total Billed: $${analysis.total_amount.toFixed(2)}
Total Overcharge: $${analysis.total_overcharge.toFixed(2)}
Today Date: ${today}

Overcharge Details: ${overchargeDetails}

Cite these laws: ${legalRefs}

Format as a professional business letter. Include placeholders: [YOUR NAME], [YOUR ADDRESS], [PROVIDER ADDRESS], [ACCOUNT NUMBER].
Request written response within 30 days. State regulatory complaint will be filed if no response.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: DISPUTE_LETTER_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: 2048,
  });

  const letter = response.choices[0]?.message?.content;
  if (!letter) throw new Error('Failed to generate dispute letter');
  return letter;
}
