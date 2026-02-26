'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { updateProfile } from '@/lib/actions/profile';
import { getInitials } from '@/lib/utils';
import type { Profile } from '@/types/database';

/* ---- Types ---- */

interface SettingsPageProps {
  profile: Profile | null;
}

type SettingsTab = 'profile' | 'account' | 'notifications' | 'subscription';

interface NotificationPreferences {
  jobMatches: boolean;
  weeklySummary: boolean;
  courseReminders: boolean;
  careerPathUpdates: boolean;
}

/* ---- Tab Config ---- */

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  { id: 'account', label: 'Account', icon: <Shield className="h-4 w-4" /> },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: 'subscription',
    label: 'Subscription',
    icon: <CreditCard className="h-4 w-4" />,
  },
];

const EDUCATION_LEVELS = [
  'High School',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate',
  'Professional Certification',
  'Self-taught',
  'Other',
];

/* ---- Plan data ---- */

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
}

const PLAN_FEATURES: PlanFeature[] = [
  { name: 'Skills Assessment', free: true, pro: true, premium: true },
  { name: 'Career Path Explorer', free: true, pro: true, premium: true },
  { name: 'Job Matching', free: '5/month', pro: 'Unlimited', premium: 'Unlimited' },
  { name: 'Resume Builder', free: '1 resume', pro: '5 resumes', premium: 'Unlimited' },
  { name: 'AI Resume Optimization', free: false, pro: true, premium: true },
  { name: 'Learning Plans', free: '1 plan', pro: '5 plans', premium: 'Unlimited' },
  { name: 'Mentor Sessions', free: false, pro: '2/month', premium: 'Unlimited' },
  { name: 'Priority Support', free: false, pro: false, premium: true },
  { name: 'Analytics Dashboard', free: false, pro: true, premium: true },
];

/* ---- Main Component ---- */

export function SettingsPage({ profile }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Side nav (desktop) / Top tabs (mobile) */}
        <nav className="shrink-0">
          {/* Mobile: horizontal tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)] p-1 lg:hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop: vertical side nav */}
          <div className="hidden lg:flex lg:w-52 lg:flex-col lg:gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <ProfileTab profile={profile} />
          )}
          {activeTab === 'account' && (
            <AccountTab profile={profile} />
          )}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'subscription' && <SubscriptionTab />}
        </div>
      </div>
    </div>
  );
}

/* ---- Profile Tab ---- */

function ProfileTab({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [headline, setHeadline] = useState(profile?.headline ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [currentRole, setCurrentRole] = useState(profile?.current_role ?? '');
  const [currentIndustry, setCurrentIndustry] = useState(
    profile?.current_industry ?? ''
  );
  const [yearsExperience, setYearsExperience] = useState(
    profile?.years_experience?.toString() ?? ''
  );
  const [educationLevel, setEducationLevel] = useState(
    profile?.education_level ?? ''
  );

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName || null,
        headline: headline || null,
        bio: bio || null,
        location: location || null,
        current_role: currentRole || null,
        current_industry: currentIndustry || null,
        years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
        education_level: educationLevel || null,
      });
      addToast('Profile updated successfully', 'success');
      router.refresh();
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  const initials = fullName ? getInitials(fullName) : '?';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar placeholder */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xl font-bold">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {fullName || 'Your Name'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {headline || 'Add a headline to your profile'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
          />
          <Input
            label="Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Software Engineer | Career Changer"
          />
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your background, and career goals..."
              rows={4}
              className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            />
          </div>
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="San Francisco, CA"
          />
          <Input
            label="Current Role"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="Marketing Manager"
          />
          <Input
            label="Current Industry"
            value={currentIndustry}
            onChange={(e) => setCurrentIndustry(e.target.value)}
            placeholder="Technology"
          />
          <Input
            label="Years of Experience"
            type="number"
            min="0"
            max="50"
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            placeholder="5"
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Education Level
            </label>
            <select
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1"
            >
              <option value="">Select education level</option>
              {EDUCATION_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={handleSave} isLoading={saving}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}

/* ---- Account Tab ---- */

function AccountTab({ profile }: { profile: Profile | null }) {
  const { addToast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Please fill in all password fields', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }
    addToast(
      'Password changes are handled via Supabase Auth. Please use the password reset flow.',
      'info'
    );
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="space-y-6">
      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <div className="flex h-10 w-full items-center rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 text-sm text-[var(--muted-foreground)]">
              {profile?.id ? 'Linked to your Supabase Auth account' : 'Not available'}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Your email is managed through your authentication provider.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Password changes are handled via Supabase Auth.
          </p>
          <Button onClick={handleChangePassword} variant="secondary">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </p>
          <Button
            variant="danger"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and will delete all your data including
              skills, resumes, learning progress, and job matches.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              To delete your account, please contact our support team at{' '}
              <span className="font-medium">support@skillbridge.app</span>.
              We will process your request within 48 hours.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---- Notifications Tab ---- */

const NOTIFICATION_STORAGE_KEY = 'skillbridge-notification-prefs';

function NotificationsTab() {
  const { addToast } = useToast();

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    jobMatches: true,
    weeklySummary: true,
    courseReminders: true,
    careerPathUpdates: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  function handleToggle(key: keyof NotificationPreferences) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(prefs));
      addToast('Notification preferences saved', 'success');
    } catch {
      addToast('Failed to save preferences', 'error');
    }
  }

  const toggleItems: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
  }[] = [
    {
      key: 'jobMatches',
      label: 'New Job Matches',
      description:
        'Receive email notifications when new jobs match your skills and preferences.',
    },
    {
      key: 'weeklySummary',
      label: 'Weekly Progress Summary',
      description:
        'Get a weekly email summarizing your learning progress, skills, and career milestones.',
    },
    {
      key: 'courseReminders',
      label: 'Course Reminders',
      description:
        'Receive reminders about upcoming course deadlines and in-progress courses.',
    },
    {
      key: 'careerPathUpdates',
      label: 'Career Path Updates',
      description:
        'Get notified about changes to career paths you are following, including new opportunities.',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {toggleItems.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {item.label}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {item.description}
              </p>
            </div>
            <button
              role="switch"
              aria-checked={prefs[item.key]}
              onClick={() => handleToggle(item.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 ${
                prefs[item.key] ? 'bg-brand-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  prefs[item.key] ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}

        <Button onClick={handleSave}>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

/* ---- Subscription Tab ---- */

function SubscriptionTab() {
  const { addToast } = useToast();

  const plans: {
    id: 'free' | 'pro' | 'premium';
    name: string;
    price: string;
    period: string;
    description: string;
    highlighted: boolean;
  }[] = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started with basic career tools.',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'Unlock advanced features and AI-powered tools.',
      highlighted: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$49',
      period: '/month',
      description: 'Everything in Pro plus mentoring and priority support.',
      highlighted: false,
    },
  ];

  // For now, assume the user is on the free plan
  const currentPlan: 'free' | 'pro' | 'premium' = 'free';

  function handleUpgrade(planId: string) {
    addToast('Coming soon! Subscription upgrades will be available shortly.', 'info');
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="default" size="md">
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </Badge>
            <span className="text-sm text-[var(--muted-foreground)]">
              You are currently on the{' '}
              <span className="font-medium text-[var(--foreground)]">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </span>{' '}
              plan.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.highlighted
                ? 'ring-2 ring-brand-500 shadow-card-hover'
                : ''
            }
          >
            <CardContent className="p-6">
              {plan.highlighted && (
                <Badge variant="default" size="sm" className="mb-3">
                  Most Popular
                </Badge>
              )}
              <h3 className="font-heading text-lg font-bold text-[var(--card-foreground)]">
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[var(--foreground)]">
                  {plan.price}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {plan.period}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {plan.description}
              </p>
              <div className="mt-4">
                {currentPlan === plan.id ? (
                  <Button variant="secondary" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {plans.indexOf(plan) > plans.findIndex((p) => p.id === currentPlan)
                      ? 'Upgrade'
                      : 'Downgrade'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-3 pr-4 text-left font-medium text-[var(--foreground)]">
                    Feature
                  </th>
                  <th className="pb-3 px-4 text-center font-medium text-[var(--foreground)]">
                    Free
                  </th>
                  <th className="pb-3 px-4 text-center font-medium text-brand-600">
                    Pro
                  </th>
                  <th className="pb-3 pl-4 text-center font-medium text-[var(--foreground)]">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    <td className="py-3 pr-4 text-[var(--foreground)]">
                      {feature.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <FeatureValue value={feature.free} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <FeatureValue value={feature.pro} />
                    </td>
                    <td className="py-3 pl-4 text-center">
                      <FeatureValue value={feature.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---- Feature Value Helper ---- */

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-green-600" />
    ) : (
      <span className="text-[var(--muted-foreground)]">&mdash;</span>
    );
  }
  return (
    <span className="text-xs font-medium text-[var(--foreground)]">
      {value}
    </span>
  );
}
