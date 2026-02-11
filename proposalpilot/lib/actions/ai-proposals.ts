'use server';

import { generateProposalContent } from './openai';

interface ActionResult<T = null> { data?: T; error?: string; }

export async function generateProposalSections(
  clientBrief: string,
  clientName: string,
  industry: string,
  services: string
): Promise<ActionResult<string>> {
  return generateProposalContent(clientBrief, clientName, industry, services);
}
