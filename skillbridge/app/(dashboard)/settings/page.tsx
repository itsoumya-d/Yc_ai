"use client";
import { useState, useEffect } from "react";
import { Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, Subscription } from "@/types/database";

const PLANS = [
  { name: "Free", price: "$0/mo", plan: "free" as const },
  { name: "Navigator", price: "$29/mo", plan: "navigator" as const },
  { name: "Pro", price: "$99/mo", plan: "pro" as const },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("id", user.id).single(),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).single(),
      ]);
      if (p) setProfile(p);
      if (s) setSubscription(s);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_profiles").update({
        full_name: profile.full_name,
        location: profile.location,
        current_occupation: profile.current_occupation,
        bio: profile.bio,
      }).eq("id", user.id);
    }
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleUpgrade(plan: string) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--foreground)" }}>Settings</h1>
      <div className="p-6 rounded-2xl border mb-6" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-bold mb-4" style={{ color: "var(--foreground)" }}>Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Full name</label>
              <input value={profile.full_name || ""} onChange={(e) => setProfile(p => ({ ...p, full_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Location</label>
              <input value={profile.location || ""} onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }} placeholder="City, State" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Current occupation</label>
            <input value={profile.current_occupation || ""} onChange={(e) => setProfile(p => ({ ...p, current_occupation: e.target.value }))} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Bio</label>
            <textarea value={profile.bio || ""} onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }} />
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: "var(--primary)" }}>
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            {saved && <Check className="w-3 h-3" />}
            {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="font-bold mb-1" style={{ color: "var(--foreground)" }}>Billing &amp; Plan</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
          Current plan: <strong>{subscription?.plan || "free"}</strong>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PLANS.map((planItem) => (
            <div key={planItem.plan} className="p-4 rounded-xl border text-center" style={{ borderColor: subscription?.plan === planItem.plan ? "var(--primary)" : "var(--border)", backgroundColor: subscription?.plan === planItem.plan ? "#ccfbf1" : "var(--background)" }}>
              <p className="font-bold text-sm mb-0.5" style={{ color: "var(--foreground)" }}>{planItem.name}</p>
              <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>{planItem.price}</p>
              {subscription?.plan !== planItem.plan && planItem.plan !== "free" ? (
                <button onClick={() => handleUpgrade(planItem.plan)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: "var(--primary)" }}>Upgrade</button>
              ) : subscription?.plan === planItem.plan ? (
                <p className="text-xs font-medium" style={{ color: "var(--primary)" }}>Current plan</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
