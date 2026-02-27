'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? 'Sign up failed');
      setLoading(false);
      return;
    }

    // 2. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: company || `${name}'s Team` })
      .select('id')
      .single();

    if (orgError) {
      setError('Failed to create organization');
      setLoading(false);
      return;
    }

    // 3. Update user with org and seed stages
    await supabase.from('users').update({ organization_id: org.id }).eq('id', authData.user.id);
    await supabase.rpc('seed_pipeline_stages', { org_id: org.id });

    router.replace('/pipeline');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1117] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Start free trial</h1>
          <p className="mt-1 text-sm text-slate-400">No credit card required</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {[
            { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Jane Smith' },
            { label: 'Work Email', value: email, setter: setEmail, type: 'email', placeholder: 'jane@company.com' },
            { label: 'Company Name', value: company, setter: setCompany, type: 'text', placeholder: 'Acme Corp' },
            { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: 'Min. 8 characters' },
          ].map(({ label, value, setter, type, placeholder }) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full rounded-xl border border-[#2a3147] bg-[#1a1f2e] px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
                placeholder={placeholder}
                required={label !== 'Company Name'}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
