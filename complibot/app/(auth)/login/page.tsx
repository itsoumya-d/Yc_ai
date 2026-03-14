"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8" style={{ color: "var(--primary)" }} />
            <span className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>CompliBot</span>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>Welcome back</h1>
          <p style={{ color: "var(--muted-foreground)" }}>Sign in to your compliance dashboard</p>
        </div>
        <div className="rounded-2xl border p-8" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: "#fef2f2", color: "var(--danger)" }}>
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }} placeholder="you@company.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: "var(--foreground)" }}>Password</label>
                <Link href="/forgot-password" className="text-xs" style={{ color: "var(--primary)" }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 pr-10" style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg font-medium text-white disabled:opacity-50" style={{ background: "var(--primary)" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: "var(--muted-foreground)" }}>
            No account yet?{" "}
            <Link href="/signup" className="font-medium" style={{ color: "var(--primary)" }}>Start free trial</Link>
          </p>
        </div>
      </div>
    </div>
  );
}