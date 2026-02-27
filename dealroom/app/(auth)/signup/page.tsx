"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("Check your email to confirm your account!");
    router.push("/login");
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-2">
        Create your account
      </h2>
      <p className="text-primary-200 text-sm mb-6">
        Start closing more deals with AI
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-200 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-200 mb-1.5">
            Work Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
            placeholder="jane@company.com"
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
            minLength={6}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-sm"
            placeholder="Min. 6 characters"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full bg-white text-primary-700 hover:bg-primary-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-xs text-primary-300 mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>

      <p className="text-center text-sm text-primary-300 mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary-200 hover:text-white font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
