'use server';

import { rewriteResume } from './ai';

export async function rewriteResumeAction(
  resumeText: string,
  targetRole: string
): Promise<{ data?: string; error?: string }> {
  if (!resumeText.trim()) return { error: 'Resume text cannot be empty' };
  if (!targetRole.trim()) return { error: 'Target role is required' };
  if (resumeText.length > 10000) return { error: 'Resume is too long (max 10,000 characters)' };

  return rewriteResume(resumeText, targetRole);
}
