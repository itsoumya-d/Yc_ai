import { Settings, User, Wrench, CreditCard, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchProfile } from '@/lib/actions/dashboard';

export default async function SettingsPage() {
  const profileResult = await fetchProfile();
  const profile = profileResult.success ? profileResult.data : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-safety-500" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Your personal and trade details</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Full Name</label>
            <input
              type="text"
              name="full_name"
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500"
              defaultValue={profile?.full_name ?? ''}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Primary Trade</label>
            <select
              name="trade"
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500"
              defaultValue={profile?.trade ?? 'general'}
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="hvac">HVAC</option>
              <option value="carpentry">Carpentry</option>
              <option value="welding">Welding</option>
              <option value="general">General</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Skill Level</label>
            <select
              name="skill_level"
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500"
              defaultValue={profile?.skill_level ?? 'beginner'}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Years Experience</label>
            <input
              type="number"
              name="years_experience"
              min={0}
              max={60}
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500"
              defaultValue={profile?.years_experience ?? 0}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Company</label>
            <input
              type="text"
              name="company"
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500"
              defaultValue={profile?.company ?? ''}
              placeholder="Company name"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">License Number</label>
            <input
              type="text"
              name="license_number"
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-safety-500"
              defaultValue={profile?.license_number ?? ''}
              placeholder="Trade license #"
            />
          </div>
        </div>
        <div className="mt-4">
          <button className="bg-safety-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-safety-600 transition-colors">
            Save Profile
          </button>
        </div>
      </Card>

      {/* Subscription */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-safety-500" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>Current plan: {profile?.subscription_tier?.toUpperCase() ?? 'FREE'}</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-3 gap-3">
          {(['free', 'pro', 'master'] as const).map((tier) => (
            <div
              key={tier}
              className={`rounded-lg border p-4 ${
                profile?.subscription_tier === tier
                  ? 'border-safety-500 bg-safety-500/5'
                  : 'border-border'
              }`}
            >
              <p className="text-sm font-semibold text-text-primary capitalize">{tier}</p>
              <p className="text-xs text-text-muted mt-1">
                {tier === 'free' && 'Basic coaching features'}
                {tier === 'pro' && 'Unlimited sessions & analysis'}
                {tier === 'master' && 'Priority AI + custom guides'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-safety-500" />
            <CardTitle>Account</CardTitle>
          </div>
        </CardHeader>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <span className="text-border">|</span>
          <button className="text-sm font-medium text-error-600 hover:text-error-500 transition-colors">
            Delete Account
          </button>
        </div>
      </Card>
    </div>
  );
}
