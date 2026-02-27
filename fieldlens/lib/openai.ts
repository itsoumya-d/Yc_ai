import OpenAI from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

export const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

export interface TradeAnalysisResult {
  overall_assessment: 'good' | 'needs_attention' | 'critical';
  score: number;
  errors: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'warning' | 'critical' | 'safety';
    how_to_fix: string;
    code_reference?: string;
  }>;
  positive_observations: string[];
  next_step_guidance: string;
}

export async function analyzeTradeWork(
  imageBase64: string,
  trade: string,
  stepContext?: string,
): Promise<TradeAnalysisResult> {
  const systemPrompt = `You are an expert ${trade} trade inspector and coach with 20+ years of experience.
Your role is to analyze photos of trade work and provide specific, actionable feedback.
Always be encouraging but honest about issues. Prioritize safety above all else.`;

  const userPrompt = `Analyze this ${trade} work photo${stepContext ? ` for: ${stepContext}` : ''}.

Identify:
1. Any errors, code violations, or safety hazards
2. What's done correctly
3. Specific guidance for improvement

Return JSON only:
{
  "overall_assessment": "good" | "needs_attention" | "critical",
  "score": 0-100,
  "errors": [
    {
      "id": "1",
      "title": "Brief error name",
      "description": "What's wrong and where",
      "severity": "warning" | "critical" | "safety",
      "how_to_fix": "Step-by-step fix",
      "code_reference": "IPC 305.1" (if applicable)
    }
  ],
  "positive_observations": ["What's done well"],
  "next_step_guidance": "What to do next (1-2 sentences)"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } },
          { type: 'text', text: userPrompt },
        ],
      },
    ],
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('No response from AI');
  return JSON.parse(content) as TradeAnalysisResult;
}

export function getMockAnalysis(trade: string): TradeAnalysisResult {
  return {
    overall_assessment: 'needs_attention',
    score: 72,
    errors: [
      {
        id: '1',
        title: 'Pipe slope insufficient',
        description: 'Drain pipe appears to have less than the required 1/4" per foot slope for proper drainage.',
        severity: 'critical',
        how_to_fix: 'Re-pitch the pipe to achieve minimum 1/4" per foot slope toward drain. Use a level to verify.',
        code_reference: 'IPC 704.1',
      },
      {
        id: '2',
        title: 'Missing pipe support',
        description: 'No visible pipe hanger within the required 4-foot horizontal span.',
        severity: 'warning',
        how_to_fix: 'Install approved pipe clamp or hanger within 4 feet of last support point.',
        code_reference: 'IPC 308.5',
      },
    ],
    positive_observations: [
      'Clean pipe cuts with no burrs detected',
      'Correct pipe material for application',
    ],
    next_step_guidance: `Fix pipe slope before continuing — this is required for code compliance in ${trade} rough-in.`,
  };
}
