import OpenAI from 'openai';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface GeneratedInvoice {
  line_items: InvoiceLineItem[];
  suggested_payment_terms: number;
  suggested_notes?: string;
}

export async function generateInvoiceFromDescription(
  description: string,
  userContext?: {
    businessName?: string;
    defaultRate?: number;
    defaultPaymentTerms?: number;
  }
): Promise<GeneratedInvoice> {
  const systemPrompt = `You are an AI assistant that helps freelancers generate professional invoices from project descriptions.

Given a project description, extract:
1. Line items with descriptions, quantities, unit prices, and amounts
2. Suggested payment terms (Net 15, 30, or 60 days)
3. Optional notes or additional context

${userContext?.businessName ? `Business: ${userContext.businessName}` : ''}
${userContext?.defaultRate ? `Default hourly rate: $${userContext.defaultRate}/hr` : ''}
${userContext?.defaultPaymentTerms ? `Default payment terms: Net ${userContext.defaultPaymentTerms}` : ''}

Return ONLY valid JSON in this exact format:
{
  "line_items": [
    {
      "description": "Service or item description",
      "quantity": 1,
      "unit_price": 100.00,
      "amount": 100.00
    }
  ],
  "suggested_payment_terms": 30,
  "suggested_notes": "Optional notes"
}`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content) as GeneratedInvoice;

    // Validate and sanitize
    if (!parsed.line_items || !Array.isArray(parsed.line_items)) {
      throw new Error('Invalid line items format');
    }

    // Calculate amounts if not provided
    parsed.line_items = parsed.line_items.map((item) => ({
      ...item,
      amount: item.quantity * item.unit_price,
    }));

    return parsed;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice from description');
  }
}

export async function generateFollowUpMessage(
  invoiceDetails: {
    invoiceNumber: string;
    clientName: string;
    amount: number;
    currency: string;
    dueDate: string;
    daysOverdue?: number;
  },
  messageType: 'friendly' | 'reminder' | 'firm' | 'final'
): Promise<{ subject: string; body: string }> {
  const toneInstructions = {
    friendly: 'polite and friendly, assuming the payment was simply overlooked',
    reminder: 'professional and courteous, but slightly more direct',
    firm: 'professional but assertive, emphasizing the importance of payment',
    final: 'formal and serious, indicating final notice before escalation',
  };

  const systemPrompt = `Generate a professional payment reminder email.
Tone: ${toneInstructions[messageType]}

Invoice Details:
- Number: ${invoiceDetails.invoiceNumber}
- Client: ${invoiceDetails.clientName}
- Amount: ${invoiceDetails.amount} ${invoiceDetails.currency}
- Due Date: ${invoiceDetails.dueDate}
${invoiceDetails.daysOverdue ? `- Days Overdue: ${invoiceDetails.daysOverdue}` : ''}

Return JSON with "subject" and "body" fields. Keep it concise and professional.`;

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating follow-up message:', error);
    throw new Error('Failed to generate follow-up message');
  }
}
