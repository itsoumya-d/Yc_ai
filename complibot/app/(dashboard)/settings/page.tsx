'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/toast';
import { createBrowserClient } from '@/lib/supabase/client';
import { Loader2, Save, Building2, User } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ full_name?: string; role?: string; email?: string }>({});
  const [org, setOrg] = useState<{ name?: string; industry?: string; size?: string }>({});
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setProfile((p) => ({ ...p, email: user.email }));

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (prof) {
        setProfile({ full_name: prof.full_name ?? '', role: prof.role ?? '', email: user.email });
        setOrgId(prof.organization_id ?? null);

        if (prof.organization_id) {
          const { data: orgData } = await supabase.from('organizations').select('*').eq('id', prof.organization_id).single();
          if (orgData) {
            setOrg({ name: orgData.name ?? '', industry: orgData.industry ?? '', size: orgData.size ?? '' });
          }
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: profile.full_name ?? null,
      role: profile.role ?? null,
      updated_at: new Date().toISOString(),
    });

    setSavingProfile(false);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Profile saved!', 'success');
    }
  };

  const handleSaveOrg = async () => {
    if (!orgId) return;
    setSavingOrg(true);

    const { error } = await supabase.from('organizations').update({
      name: org.name ?? '',
      industry: org.industry ?? null,
      size: org.size ?? null,
      updated_at: new Date().toISOString(),
    }).eq('id', orgId);

    setSavingOrg(false);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Organization updated!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and organization settings." />

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar alt={profile.full_name ?? 'User'} size="xl" />
            <div>
              <p className="text-sm font-medium text-slate-900">{profile.full_name ?? 'Your Name'}</p>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role / Title</label>
              <input
                type="text"
                value={profile.role ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
                placeholder="Compliance Manager"
                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile}>
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Organization */}
      {orgId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={org.name ?? ''}
                  onChange={(e) => setOrg((o) => ({ ...o, name: e.target.value }))}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
                <select
                  value={org.industry ?? ''}
                  onChange={(e) => setOrg((o) => ({ ...o, industry: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry...</option>
                  {['Technology', 'Healthcare', 'Finance', 'Legal', 'Education', 'Manufacturing', 'Retail', 'Other'].map(
                    (i) => <option key={i} value={i}>{i}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
                <select
                  value={org.size ?? ''}
                  onChange={(e) => setOrg((o) => ({ ...o, size: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select size...</option>
                  {['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'].map(
                    (s) => <option key={s} value={s}>{s} employees</option>
                  )}
                </select>
              </div>
            </div>
            <Button onClick={handleSaveOrg} disabled={savingOrg}>
              {savingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Organization
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
