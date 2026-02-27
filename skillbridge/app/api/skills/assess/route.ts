import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { answers } = body as { answers: { question: string; answer: string }[] };

  const prompt = `Based on these quiz answers about a person's work experience and skills, extract a list of transferable skills.

Quiz answers:
${answers.map((a) => `Q: ${a.question}
A: ${a.answer}`).join("

")}

Return a JSON object with a "skills" array, where each skill has:
- name: skill name
- level: "beginner" | "intermediate" | "advanced" | "expert"
- years_experience: estimated years (integer)

Extract 5-10 specific, actionable skills. Return ONLY valid JSON.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) return NextResponse.json({ error: "No response" }, { status: 500 });

    const parsed = JSON.parse(content);
    const skills = parsed.skills || [];

    for (const skill of skills) {
      await supabase.from("skills").insert({
        user_id: user.id,
        name: skill.name,
        level: skill.level,
        years_experience: skill.years_experience || 0,
        source: "quiz",
      });
    }

    return NextResponse.json({ skills, count: skills.length });
  } catch (err) {
    console.error("assess error:", err);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}
