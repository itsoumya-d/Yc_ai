import { getUser, signOut } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, MapPin, Bell, Shield, CreditCard, LogOut } from 'lucide-react';

export const metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const fullName = user.user_metadata?.full_name ?? 'User';
  const email = user.email ?? '';

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 font-heading sm:text-3xl">
          Settings
        </h1>
        <p className="text-stone-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <Card>
        <CardTitle>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-stone-400" />
            Account
          </div>
        </CardTitle>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-700">Name</p>
              <p className="text-sm text-stone-500">{fullName}</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-700">Email</p>
              <p className="text-sm text-stone-500">{email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription */}
      <Card>
        <CardTitle>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-stone-400" />
            Subscription
          </div>
        </CardTitle>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="teal">Free Plan</Badge>
            <span className="text-sm text-stone-500">3 career paths, basic features</span>
          </div>
          <Button variant="accent" size="sm">Upgrade</Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-stone-400" />
            Notifications
          </div>
        </CardTitle>
        <div className="mt-4 space-y-3">
          {[
            { label: 'Daily job matches', description: 'Get notified about new job matches' },
            { label: 'Weekly progress summary', description: 'Recap of your learning progress' },
            { label: 'Course reminders', description: 'Stay on track with your learning plan' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-stone-700">{item.label}</p>
                <p className="text-xs text-stone-500">{item.description}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy */}
      <Card>
        <CardTitle>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-stone-400" />
            Privacy
          </div>
        </CardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-stone-700">Profile visibility</p>
              <p className="text-xs text-stone-500">Allow mentors to find you</p>
            </div>
            <Badge variant="default">Private</Badge>
          </div>
          <div className="pt-2">
            <Button variant="outline" size="sm">Export My Data</Button>
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <form action={signOut}>
        <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </div>
  );
}
