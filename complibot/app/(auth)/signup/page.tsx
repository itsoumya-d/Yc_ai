"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, company: form.company } },
    });
    if (err) { setError(err.message); setLoading(false); }
    else { router.push("/onboarding"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8" style={{ color: "var(--primary)" }} />
            <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>CompliBot</span>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Start your free trial</h1>
          <p style={{ color: "var(--muted-foreground)" }}>14 days free. No credit card required.</p>
        </div>
        <div className="rounded-2xl border p-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: "#fef2f2", color: "var(--danger)" }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Full name</label>
                <input type="text" value={form.name} onChange={set("name")} required className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)" }} placeholder="Jane Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Company</label>
                <input type="text" value={form.company} onChange={set("company")} required className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)" }} placeholder="Acme Inc." />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Work email</label>
              <input type="email" value={form.email} onChange={set("email")} required className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--border)", background: "var(--background)" }} placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password} onChange={set("password")} required minLength={8} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none pr-10" style={{ borderColor: "var(--border)", background: "var(--background)" }} placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-medium text-white disabled:opacity-50" style={{ background: "var(--primary)" }}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: "var(--muted-foreground)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--primary)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}