import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { signIn, signUp } from '@/lib/auth';
import { Shield, Mail, Lock, User, Building2, Eye, EyeOff, Loader2 } from 'lucide-react';

type AuthMode = 'sign-in' | 'sign-up';

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'sign-up') {
        if (!fullName.trim()) { setError('Full name is required'); setLoading(false); return; }
        await signUp({ email, password, fullName: fullName.trim(), organizationName: orgName.trim() });
        setSuccess('Account created! Check your email to verify, then sign in.');
        setMode('sign-in');
      } else {
        await signIn({ email, password });
        // Auth state change is handled by the onAuthStateChange listener in App
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, fullName, orgName]);

  return (
    <div className="flex h-screen flex-col bg-bg-root">
      {/* Header */}
      <div className="flex flex-col items-center px-6 pt-16 pb-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-safety-yellow shadow-lg">
          <Shield className="h-8 w-8 text-text-inverse" />
        </div>
        <h1 className="snap-heading-bold mt-4 text-2xl text-text-primary">ComplianceSnap</h1>
        <p className="mt-1 text-sm text-text-secondary">AI-Powered Safety Compliance</p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto px-6 pb-8">
        {/* Mode Toggle */}
        <div className="mb-6 flex rounded-xl bg-bg-card p-1">
          {(['sign-in', 'sign-up'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors',
                mode === m
                  ? 'bg-safety-yellow text-text-inverse'
                  : 'text-text-secondary',
              )}
            >
              {m === 'sign-in' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'sign-up' && (
            <>
              {/* Full Name */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Mitchell"
                    className="h-12 w-full rounded-xl border border-border-default bg-bg-card pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-safety-yellow focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Manufacturing"
                    className="h-12 w-full rounded-xl border border-border-default bg-bg-card pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-safety-yellow focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-12 w-full rounded-xl border border-border-default bg-bg-card pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-safety-yellow focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-secondary">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'sign-up' ? 'Min 6 characters' : 'Your password'}
                minLength={mode === 'sign-up' ? 6 : undefined}
                className="h-12 w-full rounded-xl border border-border-default bg-bg-card pl-10 pr-12 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-safety-yellow focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-severity-critical-bg p-3 text-xs text-severity-critical">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl bg-compliant-bg p-3 text-xs text-compliant">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-colors',
              loading
                ? 'bg-safety-yellow/50 text-text-inverse/50 cursor-not-allowed'
                : 'bg-safety-yellow text-text-inverse active:bg-safety-yellow-dark',
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Continue offline */}
        <div className="mt-6 text-center">
          <p className="text-xs text-text-secondary">
            Data syncs to cloud when online. Works offline too.
          </p>
        </div>
      </div>
    </div>
  );
}
