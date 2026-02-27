import OpenAI from "openai";
import type { Job } from "@/types/index";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "",
  dangerouslyAllowBrowser: true,
});

export async function parseJobFromText(text: string): Promise<Partial<Job>> {
  const today = new Date();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a dispatch assistant for a field service company. Parse job intake text into structured data. Today's date is ${today.toISOString().split("T")[0]}.`,
        },
        {
          role: "user",
          content: `Parse this job request into JSON:

"${text}"

Return JSON with these fields (use null for unknown):
{
  "title": "brief job title (e.g. 'AC Repair', 'Plumbing Fix')",
  "job_type": "type of service (e.g. 'HVAC', 'Plumbing', 'Electrical', 'General')",
  "customer_name": "customer full name or null",
  "customer_phone": "phone number or null",
  "address": "full address or null",
  "description": "detailed description of work needed",
  "priority": "urgent|high|normal|low",
  "scheduled_date": "ISO date string (YYYY-MM-DD) or today if 'today', tomorrow if 'tomorrow'",
  "scheduled_time": "HH:MM in 24h format or null",
  "estimated_duration": integer minutes (default 60)
}

Priority rules: "urgent" or "emergency" = urgent, "ASAP" = high, default = normal.
Date rules: "today" = ${today.toISOString().split("T")[0]}, "tomorrow" = ${new Date(today.getTime() + 86400000).toISOString().split("T")[0]}.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 300,
    });

    const parsed = JSON.parse(
      completion.choices[0].message.content ?? "{}"
    ) as Partial<Job>;

    // Ensure scheduled_date is a full ISO string
    if (parsed.scheduled_date && !parsed.scheduled_date.includes("T")) {
      parsed.scheduled_date = new Date(parsed.scheduled_date).toISOString();
    }

    return parsed;
  } catch {
    // Fallback: return minimal job
    return {
      title: "New Job",
      description: text,
      priority: "normal",
      scheduled_date: today.toISOString(),
      estimated_duration: 60,
    };
  }
}

export async function suggestTechnicianForJob(
  job: Partial<Job>,
  technicians: Array<{ id: string; name: string; skills?: string[]; jobCount: number }>,
  userId: string
): Promise<{ technicianId: string; reason: string } | null> {
  if (technicians.length === 0) return null;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Assign a technician to this job.

Job: ${job.title} (${job.job_type ?? "General"})
Priority: ${job.priority ?? "normal"}
Description: ${job.description ?? "N/A"}

Available technicians:
${technicians.map((t, i) => `${i + 1}. ${t.name} (skills: ${t.skills?.join(", ") ?? "general"}, ${t.jobCount} jobs today)`).join("\n")}

Return JSON: { "technicianIndex": <1-based index>, "reason": "brief reason" }`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 100,
    });

    const result = JSON.parse(completion.choices[0].message.content ?? "{}") as {
      technicianIndex: number;
      reason: string;
    };

    const index = (result.technicianIndex ?? 1) - 1;
    const tech = technicians[Math.max(0, Math.min(index, technicians.length - 1))];

    return { technicianId: tech.id, reason: result.reason ?? "" };
  } catch {
    return null;
  }
}

export async function generateJobSummary(jobs: Job[]): Promise<string> {
  if (jobs.length === 0) return "No jobs scheduled.";

  const summary = jobs.map((j) => ({
    title: j.title,
    status: j.status,
    priority: j.priority,
    address: j.address,
    time: j.scheduled_time,
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `Summarize today's ${jobs.length} field service jobs in 2-3 sentences for a dispatcher briefing. Jobs: ${JSON.stringify(summary)}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    return completion.choices[0].message.content ?? "";
  } catch {
    return `${jobs.length} jobs scheduled today. ${jobs.filter((j) => j.priority === "urgent").length} urgent.`;
  }
}
