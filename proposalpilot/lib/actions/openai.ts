'use server';

import OpenAI from 'openai';
import type { SectionType } from '@/types/database';

interface ActionResult<T = null> { data?: T; error?: string; }

export interface GeneratedSection {
  title: string;
  content: string;
  section_type: SectionType;
}

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

const SECTION_TYPE_MAP: Record<string, SectionType> = {
  'executive summary': 'executive_summary',
  'scope of work': 'scope',
  'scope': 'scope',
  'timeline': 'timeline',
  'timeline & milestones': 'timeline',
  'milestones': 'timeline',
  'pricing': 'pricing',
  'investment': 'pricing',
  'budget': 'pricing',
  'team': 'team',
  'our team': 'team',
  'case studies': 'case_studies',
  'references': 'case_studies',
  'terms': 'terms',
  'terms & conditions': 'terms',
  'terms and conditions': 'terms',
};

function inferSectionType(title: string): SectionType {
  const lower = title.toLowerCase().trim();
  for (const [key, type] of Object.entries(SECTION_TYPE_MAP)) {
    if (lower.includes(key)) return type;
  }
  return 'custom';
}

export async function generateProposalContent(
  clientBrief: string,
  clientName: string,
  industry: string,
  services: string
): Promise<ActionResult<GeneratedSection[]>> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert proposal writer for agencies and consultancies. Generate professional, persuasive proposal content as structured JSON.

Return a JSON object with a "sections" array. Each section must have:
- "title": string (section heading)
- "content": string (3-6 paragraphs of professional content)
- "section_type": one of: "executive_summary", "scope", "timeline", "pricing", "team", "case_studies", "terms", "custom"

Be specific, actionable, and persuasive. Tailor content to the client's industry and needs.`,
        },
        {
          role: 'user',
          content: `Generate a complete professional proposal for:

Client: ${clientName || 'Our Client'}
Industry: ${industry || 'General'}
Services: ${services || 'Professional Services'}

Client Brief:
${clientBrief}

Create 5-7 sections covering the most relevant areas. Make the content specific and compelling.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { error: 'No response from AI' };

    const parsed = JSON.parse(content) as { sections?: Array<{ title: string; content: string; section_type?: string }> };

    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      return { error: 'Invalid response format from AI' };
    }

    const sections: GeneratedSection[] = parsed.sections.map((s) => ({
      title: s.title,
      content: s.content,
      section_type: (s.section_type as SectionType) || inferSectionType(s.title),
    }));

    return { data: sections };
  } catch (error) {
    console.error('OpenAI error:', error);
    return { error: 'Failed to generate proposal content. Please try again.' };
  }
}
