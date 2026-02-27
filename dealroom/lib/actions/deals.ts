"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type CreateDealInput = {
  name: string;
  company: string;
  value: number;
  stage: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  expected_close_date?: string | null;
  description?: string | null;
  probability?: number;
  source?: string | null;
};

export async function createDeal(input: CreateDealInput) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      ...input,
      user_id: user.id,
      ai_score: 0,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");

  return { data, error: null };
}

export async function updateDeal(
  dealId: string,
  updates: Partial<CreateDealInput>
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("deals")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", dealId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  revalidatePath("/dashboard");

  return { data, error: null };
}

export async function updateDealStage(dealId: string, newStage: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("deals")
    .update({ stage: newStage, updated_at: new Date().toISOString() })
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Log stage change as activity
  await supabase.from("deal_activities").insert({
    deal_id: dealId,
    content: `Stage changed to ${newStage.replace(/_/g, " ")}`,
    type: "stage_change",
    user_id: user.id,
  });

  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");

  return { error: null };
}

export async function deleteDeal(dealId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("id", dealId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/deals");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");

  return { error: null };
}

export async function addDealActivity(
  dealId: string,
  content: string,
  type: "note" | "email" | "call" | "meeting" | "stage_change" = "note"
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase.from("deal_activities").insert({
    deal_id: dealId,
    content,
    type,
    user_id: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/deals/${dealId}`);
  return { error: null };
}

export async function getDeal(dealId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

export async function getDeals(stage?: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Unauthorized" };
  }

  let query = supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (stage) {
    query = query.eq("stage", stage);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
