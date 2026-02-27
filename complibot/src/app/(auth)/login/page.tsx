'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Shield } from 'lucide-react';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-root px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary"><Shield className="h-6 w-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold text-text-primary">Welcome back</h1><p className="mt-1 text-sm text-text-secondary">Sign in to your compliance dashboard</p></div>
        </div>
        <div className="card space-y-4">
          <div><label className="mb-1.5 block text-xs font-medium text-text-secondary">Work Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cto@startup.com" className="input" /></div>
          <div><div className="mb-1.5 flex items-center justify-between"><label className="text-xs font-medium text-text-secondary">Password</label><Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link></div><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input" /></div>
          <Link href="/dashboard" className="btn-primary w-full justify-center text-sm">Sign In</Link>
          <p className="text-center text-xs text-text-secondary">No account? <Link href="/signup" className="text-primary hover:underline">Start free trial</Link></p>
        </div>
      </div>
    </div>
  );
}
