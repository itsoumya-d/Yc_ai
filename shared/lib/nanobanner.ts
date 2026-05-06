/**
 * NanoBanner AI Image Generation Helper
 * Wraps the NanoBanner API for generating hero images, onboarding illustrations,
 * empty states, and App Store / Play Store assets.
 *
 * Usage:
 *   import { generateImage, NanoBannerPreset } from '@/lib/nanobanner';
 *   const url = await generateImage('cinematic hero shot of …', { preset: 'hero' });
 *
 * Env vars required:
 *   NANOBANNER_API_KEY=<your key>
 *   NANOBANNER_BASE_URL=https://api.nanobanner.ai  (optional override)
 */

export type NanoBannerPreset =
  | 'hero'          // 1920×1080 widescreen
  | 'onboarding'    // 1080×1920 portrait (mobile onboarding slide)
  | 'feature'       // 1200×800 feature card
  | 'empty-state'   // 800×600 in-app empty state
  | 'app-store'     // 1242×2688 iOS App Store screenshot
  | 'play-store'    // 1080×1920 Google Play screenshot
  | 'og-image'      // 1200×630 Open Graph / Twitter card
  | 'square';       // 1080×1080 square (Instagram / icon-like)

export interface NanoBannerOptions {
  preset?: NanoBannerPreset;
  width?: number;
  height?: number;
  style?: 'photorealistic' | 'illustration' | '3d-render' | 'flat' | 'cinematic';
  quality?: 'draft' | 'standard' | 'high';
  seed?: number;
  negativePrompt?: string;
}

interface NanoBannerResponse {
  url: string;
  width: number;
  height: number;
  seed: number;
  id: string;
}

const PRESET_DIMENSIONS: Record<NanoBannerPreset, { width: number; height: number }> = {
  hero:        { width: 1920, height: 1080 },
  onboarding:  { width: 1080, height: 1920 },
  feature:     { width: 1200, height: 800 },
  'empty-state': { width: 800, height: 600 },
  'app-store': { width: 1242, height: 2688 },
  'play-store': { width: 1080, height: 1920 },
  'og-image':  { width: 1200, height: 630 },
  square:      { width: 1080, height: 1080 },
};

/**
 * Generate an image via the NanoBanner API.
 * Returns the CDN URL of the generated image.
 */
export async function generateImage(
  prompt: string,
  options: NanoBannerOptions = {},
): Promise<string> {
  const apiKey = process.env.NANOBANNER_API_KEY;
  if (!apiKey) throw new Error('NANOBANNER_API_KEY is not set');

  const baseUrl = process.env.NANOBANNER_BASE_URL ?? 'https://api.nanobanner.ai';

  const dims = options.preset
    ? PRESET_DIMENSIONS[options.preset]
    : { width: options.width ?? 1200, height: options.height ?? 630 };

  const body = {
    prompt,
    width:  options.width  ?? dims.width,
    height: options.height ?? dims.height,
    style:  options.style  ?? 'cinematic',
    quality: options.quality ?? 'standard',
    ...(options.seed           !== undefined && { seed: options.seed }),
    ...(options.negativePrompt !== undefined && { negative_prompt: options.negativePrompt }),
  };

  const res = await fetch(`${baseUrl}/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NanoBanner API error ${res.status}: ${text}`);
  }

  const data: NanoBannerResponse = await res.json();
  return data.url;
}

/**
 * Generate multiple images in parallel (e.g., all 3 onboarding slides).
 */
export async function generateImages(
  prompts: string[],
  options: NanoBannerOptions = {},
): Promise<string[]> {
  return Promise.all(prompts.map((p) => generateImage(p, options)));
}

/**
 * Pre-built prompt builder for common SaaS asset types.
 * Pass appName + theme colors to get a ready-to-use prompt.
 */
export function buildPrompt(
  type: 'hero' | 'onboarding' | 'feature' | 'empty-state',
  params: {
    appName: string;
    tagline?: string;
    primaryColor?: string;  // hex e.g. '#7C3AED'
    style?: string;
    subject?: string;
  },
): string {
  const { appName, tagline, primaryColor, style = 'cinematic', subject } = params;
  const colorHint = primaryColor ? `, dominant color ${primaryColor}` : '';

  const templates: Record<typeof type, string> = {
    hero: `${style} hero banner for ${appName} SaaS — ${tagline ?? subject ?? 'AI-powered platform'}${colorHint}, premium UI, dark gradient background, floating UI elements, bokeh depth-of-field, professional product photography`,
    onboarding: `mobile onboarding illustration for ${appName} — ${subject ?? 'step 1 of 3'}${colorHint}, flat vector art, friendly characters, clean white background, bold typography space at bottom`,
    feature: `feature card illustration for ${appName} — ${subject ?? 'key feature'}${colorHint}, isometric 3D render, soft shadows, white background, product-quality icon`,
    'empty-state': `empty state illustration for ${appName} — ${subject ?? 'no data yet'}${colorHint}, friendly flat illustration, encouraging message, minimal background`,
  };

  return templates[type];
}
