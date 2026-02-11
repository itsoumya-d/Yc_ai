'use server';

import OpenAI from 'openai';

interface ActionResult<T = null> { data?: T; error?: string; }

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export async function generateProposalContent(
  clientBrief: string,
  clientName: string,
  industry: string,
  services: string
): Promise<ActionResult<string>> {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert proposal writer for agencies and consultancies. Generate professional, persuasive proposal content. Output structured sections with clear headings. Be specific and actionable.',
        },
        {
          role: 'user',
          content: `Generate a professional proposal for the following:\n\nClient: ${clientName}\nIndustry: ${industry}\nServices Requested: ${services}\n\nClient Brief:\n${clientBrief}\n\nGenerate the following sections:\n1. Executive Summary\n2. Scope of Work\n3. Timeline & Milestones\n4. Pricing\n5. Team\n6. Terms & Conditions\n\nFormat each section with the title on its own line followed by the content.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const result = response.choices[0]?.message?.content;
    if (!result) return { error: 'No response from AI' };
    return { data: result };
  } catch (error) {
    console.error('OpenAI error:', error);
    return { error: 'Failed to generate proposal content. Please try again.' };
  }
}
