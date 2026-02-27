import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export interface PhotoAnalysisResult {
  phase: string | null;
  violations: string[];
  progressNotes: string;
  confidence: number;
  tags: string[];
}

export async function analyzePhoto(
  base64Image: string
): Promise<PhotoAnalysisResult | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this construction site photo. Return JSON:
{
  "phase": "<one of: Foundation, Framing, Roofing, MEP Rough-in, Insulation, Drywall, Finishes, Landscaping, General, or null>",
  "violations": ["<safety violation 1>", "<safety violation 2>"],
  "progressNotes": "<1-2 sentence description of what's visible and progress status>",
  "confidence": <0.0-1.0>,
  "tags": ["<tag1>", "<tag2>"]
}

Safety violations to check: missing hard hats, no safety vests, unsecured scaffolding, exposed electrical wiring, fall hazards, missing guardrails, improper PPE, unstable stacking of materials.

If no safety violations, set violations to empty array.
Tags should describe visible elements (e.g. "concrete work", "steel framing", "drywall installation").`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(
      completion.choices[0].message.content ?? "{}"
    ) as PhotoAnalysisResult;

    return {
      phase: result.phase ?? null,
      violations: Array.isArray(result.violations) ? result.violations : [],
      progressNotes: result.progressNotes ?? "",
      confidence: result.confidence ?? 0.5,
      tags: Array.isArray(result.tags) ? result.tags : [],
    };
  } catch {
    return null;
  }
}

export async function detectSafetyViolations(base64Image: string): Promise<{
  violations: string[];
  severity: "none" | "minor" | "major" | "critical";
  recommendation: string;
} | null> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Focus specifically on OSHA safety violations in this construction photo.

Return JSON:
{
  "violations": ["<specific violation 1>", "<specific violation 2>"],
  "severity": "<none|minor|major|critical>",
  "recommendation": "<1 sentence action to address the most critical violation>"
}

severity: none = no violations, minor = low risk, major = significant risk, critical = immediate danger.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    return JSON.parse(completion.choices[0].message.content ?? "{}");
  } catch {
    return null;
  }
}

export async function estimateProgress(
  base64Images: string[]
): Promise<{
  estimatedCompletion: number;
  currentPhase: string;
  notes: string;
} | null> {
  if (base64Images.length === 0) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Based on ${base64Images.length} site photos, estimate construction progress. Return JSON:
{
  "estimatedCompletion": <0-100 integer>,
  "currentPhase": "<phase name>",
  "notes": "<brief explanation>"
}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 100,
    });

    return JSON.parse(completion.choices[0].message.content ?? "{}");
  } catch {
    return null;
  }
}
