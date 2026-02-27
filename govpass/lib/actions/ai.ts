import OpenAI from 'openai';
import type { DocumentType, ExtractedFields } from '../../types';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
});

const DOCUMENT_PROMPTS: Record<DocumentType, string> = {
  id: `Extract key fields from this government-issued ID. Return a JSON object with fields:
    full_name, date_of_birth, id_number, expiration_date, address, state.
    Only return the JSON, no other text.`,
  tax: `Extract key fields from this tax document (W-2 or 1099). Return a JSON object with fields:
    tax_year, employer_name, wages_tips, federal_tax_withheld, state_tax_withheld, social_security_wages.
    Only return the JSON, no other text.`,
  pay_stub: `Extract key fields from this pay stub. Return a JSON object with fields:
    employer_name, pay_period_start, pay_period_end, gross_pay, net_pay, ytd_gross, ytd_taxes.
    Only return the JSON, no other text.`,
  social_security: `Extract key fields from this Social Security document. Return a JSON object with fields:
    benefit_type, monthly_amount, effective_date, recipient_name.
    Only return the JSON, no other text.`,
  bank_statement: `Extract key fields from this bank statement. Return a JSON object with fields:
    bank_name, account_type, statement_period, beginning_balance, ending_balance, average_daily_balance.
    Only return the JSON, no other text.`,
};

export async function extractDocumentFields(
  base64Image: string,
  documentType: DocumentType
): Promise<ExtractedFields> {
  const prompt = DOCUMENT_PROMPTS[documentType];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: 'high',
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');

  return JSON.parse(content) as ExtractedFields;
}
