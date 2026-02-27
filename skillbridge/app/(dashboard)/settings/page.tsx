'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, Save, User } from 'lucide-react';
import type { Profile } from '@/types/database';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: profile.full_name ?? null,
        current_role: profile.current_role ?? null,
        target_role: profile.target_role ?? null,
        years_experience: profile.years_experience ?? null,
        industry: profile.industry ?? null,
        updated_at: new Date().toISOString(),
      });

    setSaving(false);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Profile saved!', 'success');
    }
  };

  const fields = [
    { key: 'full_name', label: 'Full Name', placeholder: 'Jane Smith', type: 'text' },
    { key: 'current_role', label: 'Current Role', placeholder: 'Software Engineer', type: 'text' },
    { key: 'target_role', label: 'Target Role', placeholder: 'Product Manager', type: 'text' },
    { key: 'industry', label: 'Industry', placeholder: 'Technology', type: 'text' },
    { key: 'years_experience', label: 'Years of Experience', placeholder: '5', type: 'number' },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and account preferences." />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.avatar_url}
              alt={profile.full_name ?? 'User'}
              size="xl"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{profile.full_name ?? 'Your Name'}</p>
              <p className="text-xs text-gray-500 mt-0.5">Profile photo from avatar_url</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={(profile[field.key] as string | number | undefined) ?? ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
