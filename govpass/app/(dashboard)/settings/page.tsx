import { Settings, User, Bell, Users, Globe, Shield, LogOut } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchProfile } from '@/lib/actions/dashboard';
import { fetchHouseholdMembers } from '@/lib/actions/settings';

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

export default async function SettingsPage() {
  const [profileResult, householdResult] = await Promise.all([
    fetchProfile(),
    fetchHouseholdMembers(),
  ]);

  const profile = profileResult.success ? profileResult.data : null;
  const household = householdResult.success ? householdResult.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary font-heading">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-trust-600" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Your personal details used for eligibility checking</CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Language</label>
            <select
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
              defaultValue={profile?.preferred_language ?? 'en'}
            >
              <option value="en">English</option>
              <option value="es">Espa&ntilde;ol</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">State</label>
            <select
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
              defaultValue={profile?.state_code ?? ''}
            >
              <option value="">Select state</option>
              {usStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Household Size</label>
            <input
              type="number"
              min={1}
              max={20}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
              defaultValue={profile?.household_size ?? 1}
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Income Bracket</label>
            <select
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
              defaultValue={profile?.household_income_bracket ?? ''}
            >
              <option value="">Select range</option>
              <option value="0_15000">$0 - $15,000</option>
              <option value="15000_30000">$15,000 - $30,000</option>
              <option value="30000_50000">$30,000 - $50,000</option>
              <option value="50000_75000">$50,000 - $75,000</option>
              <option value="75000_plus">$75,000+</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Employment</label>
            <select
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
              defaultValue={profile?.employment_status ?? ''}
            >
              <option value="">Select status</option>
              <option value="employed">Employed</option>
              <option value="unemployed">Unemployed</option>
              <option value="self_employed">Self-employed</option>
              <option value="retired">Retired</option>
              <option value="disabled">Disabled</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-text-primary">Citizenship</label>
            <select
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
              defaultValue={profile?.citizenship_status ?? ''}
            >
              <option value="">Select status</option>
              <option value="citizen">U.S. Citizen</option>
              <option value="permanent_resident">Permanent Resident</option>
              <option value="visa_holder">Visa Holder</option>
              <option value="refugee">Refugee/Asylee</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-text-primary">
            <input type="checkbox" className="rounded border-border" defaultChecked={profile?.has_children_under_18} />
            Children under 18
          </label>
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-primary">Dependents:</label>
            <input
              type="number"
              min={0}
              max={20}
              className="w-16 rounded-lg border border-border bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
              defaultValue={profile?.number_of_dependents ?? 0}
            />
          </div>
        </div>
        <div className="mt-4">
          <button className="bg-trust-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-trust-700 transition-colors">
            Save Profile
          </button>
        </div>
      </Card>

      {/* Household Members */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-trust-600" />
            <CardTitle>Household Members</CardTitle>
          </div>
          <CardDescription>{household.length} member{household.length !== 1 ? 's' : ''} added</CardDescription>
        </CardHeader>
        {household.length > 0 ? (
          <div className="space-y-2">
            {household.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary capitalize">{member.relationship}</p>
                  <p className="text-xs text-text-muted">
                    {member.age_bracket?.replace('_', '-') ?? 'Age unknown'}
                    {member.is_dependent && ' · Dependent'}
                    {member.has_disability && ' · Disability'}
                    {member.is_veteran && ' · Veteran'}
                  </p>
                </div>
                <button className="text-xs text-denial-600 hover:text-denial-700">Remove</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted py-2">No household members added yet.</p>
        )}
        <div className="mt-3">
          <button className="text-sm font-medium text-trust-600 hover:text-trust-700">
            + Add Household Member
          </button>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-trust-600" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-text-primary">Push Notifications</span>
            <input type="checkbox" className="rounded border-border" defaultChecked={profile?.push_opted_in} />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-text-primary">SMS Notifications</span>
            <input type="checkbox" className="rounded border-border" defaultChecked={profile?.sms_opted_in} />
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-text-muted">Quiet hours start</label>
              <input
                type="time"
                className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
                defaultValue={profile?.quiet_hours_start ?? '22:00'}
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs text-text-muted">Quiet hours end</label>
              <input
                type="time"
                className="w-full rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-trust-500"
                defaultValue={profile?.quiet_hours_end ?? '08:00'}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Language & Accessibility */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-trust-600" />
            <CardTitle>Language &amp; Accessibility</CardTitle>
          </div>
        </CardHeader>
        <p className="text-sm text-text-secondary">
          GovPass supports English and Spanish. Change your preferred language in the profile section above.
        </p>
      </Card>

      {/* Account */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-trust-600" />
            <CardTitle>Account</CardTitle>
          </div>
        </CardHeader>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <span className="text-border">|</span>
          <button className="text-sm font-medium text-denial-600 hover:text-denial-700 transition-colors">
            Delete Account
          </button>
        </div>
      </Card>
    </div>
  );
}
