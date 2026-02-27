import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ParsedJob {
  customerName: string;
  address: string;
  serviceType: string;
  estimatedDuration: number; // minutes
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
}

export async function parseJobFromText(rawText: string): Promise<ParsedJob> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Parse this field service job request into JSON:
"${rawText}"

Return JSON with: customerName, address, serviceType, estimatedDuration (in minutes, default 60), priority (low/medium/high/urgent), notes.
Return ONLY valid JSON.`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(content) as Partial<ParsedJob>;

  return {
    customerName: parsed.customerName ?? 'Unknown Customer',
    address: parsed.address ?? '',
    serviceType: parsed.serviceType ?? 'General Maintenance',
    estimatedDuration: parsed.estimatedDuration ?? 60,
    priority: parsed.priority ?? 'medium',
    notes: parsed.notes ?? '',
  };
}

export async function getJobCompletionSuggestions(
  jobType: string,
  customerHistory: string
): Promise<string[]> {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Suggest 3-5 completion notes for a ${jobType} field service job. Customer history: ${customerHistory}. Return as JSON object with key "suggestions" containing an array of strings.`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 200,
  });

  const content = response.choices[0]?.message?.content ?? '{"suggestions":[]}';
  const result = JSON.parse(content) as { suggestions?: string[] };
  return result.suggestions ?? [];
}

export async function optimizeRouteOrder(
  stops: Array<{ id: string; address: string; priority: string; estimatedDuration: number }>
): Promise<string[]> {
  const stopsJson = JSON.stringify(stops);
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `You are a route optimizer for field service technicians. Given these stops, suggest the optimal visit order to minimize travel and prioritize urgent jobs. Return JSON with key "orderedIds" containing stop IDs in optimal order.

Stops: ${stopsJson}

Consider: urgent > high > medium > low priority, geographic clustering, and estimated durations. Return ONLY valid JSON.`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content ?? '{"orderedIds":[]}';
  const result = JSON.parse(content) as { orderedIds?: string[] };
  return result.orderedIds ?? stops.map((s) => s.id);
}
