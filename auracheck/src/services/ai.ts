const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'urgent';

export interface SkinAnalysis {
  riskLevel: RiskLevel;
  abcdeCriteria: {
    asymmetry: { score: number; note: string };
    border: { score: number; note: string };
    color: { score: number; note: string };
    diameter: { score: number; note: string };
    evolution: { score: number; note: string };
  };
  overallScore: number;
  recommendation: string;
  shouldSeeDoctor: boolean;
  urgency: string;
  disclaimer: string;
}

export async function analyzeSkinPhoto(base64Image: string, previousNote?: string): Promise<SkinAnalysis> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a skin health screening tool (NOT a medical diagnosis). Analyze this skin image using ABCDE criteria for melanoma screening. ${previousNote ? `Previous note: ${previousNote}.` : ''} Return JSON: { "riskLevel": "low|moderate|high|urgent", "abcdeCriteria": { "asymmetry": {"score": 0-3, "note": "string"}, "border": {"score": 0-3, "note": "string"}, "color": {"score": 0-3, "note": "string"}, "diameter": {"score": 0-3, "note": "string"}, "evolution": {"score": 0-3, "note": "string"} }, "overallScore": 0-15, "recommendation": "string", "shouldSeeDoctor": boolean, "urgency": "routine|soon|urgent", "disclaimer": "This is not a medical diagnosis. Please consult a dermatologist." }`
          },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}`, detail: 'high' } }
        ]
      }],
      response_format: { type: 'json_object' },
      max_tokens: 800,
    }),
  });
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? '{"riskLevel":"low","abcdeCriteria":{"asymmetry":{"score":0,"note":""},"border":{"score":0,"note":""},"color":{"score":0,"note":""},"diameter":{"score":0,"note":""},"evolution":{"score":0,"note":""}},"overallScore":0,"recommendation":"","shouldSeeDoctor":false,"urgency":"routine","disclaimer":"This is not a medical diagnosis."}');
}
