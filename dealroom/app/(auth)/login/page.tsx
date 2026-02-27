"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
    router.refresh();
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@dealroom.app",
      password: "demo123456",
    });

    if (error) {
      toast.error("Demo login failed. Please create an account.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-2">Welcome back</h2>
      <p className="text-primary-200 text-sm mb-6">Sign in to your account</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-200 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-200 mb-1.5">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-white text-primary-700 hover:bg-primary-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
        >
          Sign in
        </Button>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs text-primary-300">
          <span className="px-2 bg-transparent">or</span>
        </div>
      </div>

      <button
        onClick={handleDemoLogin}
        disabled={loading}
        className="w-full py-2.5 px-4 border border-white/20 rounded-xl text-sm font-medium text-primary-200 hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        Try with demo account
      </button>

      <p className="text-center text-sm text-primary-300 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary-200 hover:text-white font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
