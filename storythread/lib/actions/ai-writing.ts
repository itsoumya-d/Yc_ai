'use server';

import { generateWritingAssistance } from './openai';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export async function continueStory(
  chapterContent: string,
  storyContext: string,
  characters: string
): Promise<ActionResult<string>> {
  return generateWritingAssistance('continue', chapterContent, storyContext, characters);
}

export async function suggestDialogue(
  chapterContent: string,
  characterName: string,
  voiceAndSituation: string
): Promise<ActionResult<string>> {
  return generateWritingAssistance('dialogue', chapterContent, characterName, voiceAndSituation);
}

export async function rephraseText(
  selectedText: string,
  tone: string
): Promise<ActionResult<string>> {
  return generateWritingAssistance('rephrase', selectedText, tone, '');
}

export async function fixProse(text: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('fix_prose', text, '', '');
}
