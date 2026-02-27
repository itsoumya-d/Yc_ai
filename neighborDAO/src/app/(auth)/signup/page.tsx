'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Vote } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', community: '' });
  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-root px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Vote className="h-6 w-6 text-text-inverse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Create your DAO</h1>
            <p className="mt-1 text-sm text-text-secondary">Start governing your community democratically</p>
          </div>
        </div>

        <div className="card space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Maria Chen' },
            { key: 'email', label: 'Email', type: 'email', placeholder: 'maria@yourneighborhood.org' },
            { key: 'community', label: 'Community / DAO Name', type: 'text', placeholder: 'Maple Grove DAO' },
            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="input"
              />
            </div>
          ))}
          <Link href="/dashboard" className="btn-primary w-full justify-center text-sm">
            Launch DAO
          </Link>
          <p className="text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
