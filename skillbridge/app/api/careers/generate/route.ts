import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCareerPaths } from "@/lib/actions/careers";

export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const careers = await generateCareerPaths();
  if (!careers) return NextResponse.json({ error: "Generation failed" }, { status: 500 });

  return NextResponse.json({ careers, count: careers.length });
}
