import OpenAI from 'openai';
import type { RiskFinding, RiskLevel } from '@/types/database';

/**
 * Analyze contract text for risks using OpenAI.
 * Returns an array of RiskFinding objects.
 */
export async function analyzeContractRisks(
  contractText: string,
  contractId: string,
  apiKey: string,
): Promise<RiskFinding[]> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Add it in Settings → API Keys.');
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert contract analyst. Analyze the contract text for legal risks and issues.

For each risk finding, return a JSON array with objects containing:
- "id": unique string identifier
- "section_ref": the section reference (e.g., "S4.2", "Section 3")
- "severity": one of "critical", "high", "medium", "low", "info"
- "title": brief title of the issue (2-5 words)
- "explanation": 1-2 sentence explanation of the risk
- "suggested_alternative": recommended alternative language or fix (empty string if severity is "low" or "info")

Severity guidelines:
- critical: Uncapped liability, missing essential protections, one-sided indemnification
- high: Short notice periods, broad IP assignments, missing standard clauses
- medium: Non-standard terms that could be improved
- low: Minor wording improvements
- info: Standard clauses that are acceptable

Return ONLY a JSON array. Analyze up to 8 findings, prioritized by severity.`,
      },
      {
        role: 'user',
        content: contractText,
      },
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(content);
  const findings = Array.isArray(parsed) ? parsed : (parsed.findings || parsed.risks || []);

  return findings.map((f: { id?: string; section_ref?: string; severity?: RiskLevel; title?: string; explanation?: string; suggested_alternative?: string }, i: number) => ({
    id: f.id || `risk-${Date.now()}-${i}`,
    contract_id: contractId,
    section_ref: f.section_ref || `S${i + 1}`,
    severity: (f.severity || 'medium') as RiskLevel,
    title: f.title || 'Unnamed Risk',
    explanation: f.explanation || '',
    suggested_alternative: f.suggested_alternative || '',
    resolved: false,
  }));
}

/**
 * Ask a question about a contract using OpenAI.
 */
export async function askAboutContract(
  question: string,
  contractText: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[],
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required. Add it in Settings → API Keys.');
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are an expert legal assistant. Answer questions about the following contract clearly and concisely.

CONTRACT TEXT:
${contractText}

Guidelines:
- Reference specific sections when possible
- Highlight any risks or concerns related to the question
- Keep answers concise (2-4 sentences for simple questions, more for complex analysis)
- If the contract doesn't address the question, say so clearly`,
    },
    ...chatHistory.slice(-6).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: question },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    temperature: 0.3,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || 'Unable to generate a response.';
}

/**
 * Generate a clause suggestion for a given category.
 */
export async function generateClause(
  category: string,
  context: string,
  apiKey: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required.');
  }

  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert legal drafter. Generate a standard, balanced ${category} clause suitable for a commercial agreement. The clause should be fair to both parties and follow current best practices.

If contract context is provided, tailor the clause to fit. Return ONLY the clause text, no explanations.`,
      },
      {
        role: 'user',
        content: context ? `Generate a ${category} clause for this context:\n${context}` : `Generate a standard ${category} clause.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 400,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Calculate overall risk score from findings.
 */
export function calculateRiskScore(findings: RiskFinding[]): number {
  if (findings.length === 0) return 0;

  const unresolved = findings.filter((f) => !f.resolved);
  if (unresolved.length === 0) return 0;

  const weights: Record<RiskLevel, number> = {
    critical: 25,
    high: 18,
    medium: 10,
    low: 4,
    info: 1,
  };

  const totalWeight = unresolved.reduce((sum, f) => sum + weights[f.severity], 0);
  return Math.min(100, totalWeight);
}

/**
 * Determine risk level from score.
 */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  if (score > 0) return 'low';
  return 'info';
}
