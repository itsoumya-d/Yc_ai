'use server';

import { generateWritingAssistance } from './openai';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

// Continue story variants
export async function continueStory(chapterContent: string, storyContext: string, characters: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('continue', chapterContent, storyContext, characters);
}
export async function continueStoryDramatic(chapterContent: string, storyContext: string, characters: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('continue_dramatic', chapterContent, storyContext, characters);
}
export async function continueStorySubtle(chapterContent: string, storyContext: string, characters: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('continue_subtle', chapterContent, storyContext, characters);
}
export async function continueStoryAction(chapterContent: string, storyContext: string, characters: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('continue_action', chapterContent, storyContext, characters);
}
export async function continueStoryDialogue(chapterContent: string, storyContext: string, characters: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('continue_dialogue', chapterContent, storyContext, characters);
}

// Dialogue
export async function suggestDialogue(chapterContent: string, characterName: string, voiceAndSituation: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('dialogue', chapterContent, characterName, voiceAndSituation);
}
export async function improveDialogue(text: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('improve_dialogue', text, '', '');
}

// Edit & polish
export async function rephraseText(selectedText: string, tone: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('rephrase', selectedText, tone, '');
}
export async function fixProse(text: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('fix_prose', text, '', '');
}
export async function enhanceDescription(text: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('enhance_description', text, '', '');
}

// Analyze
export async function checkConsistency(chapterContent: string, storyContext: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('consistency_check', chapterContent, storyContext, '');
}
export async function detectPlotHoles(chapterContent: string, storyContext: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('plot_hole_detect', chapterContent, storyContext, '');
}
export async function analyzeReadability(text: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('readability_score', text, '', '');
}
export async function analyzeTone(text: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('tone_analyze', text, '', '');
}
export async function analyzePacing(text: string): Promise<ActionResult<string>> {
  return generateWritingAssistance('pacing_analyze', text, '', '');
}
