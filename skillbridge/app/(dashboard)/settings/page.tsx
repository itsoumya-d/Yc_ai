'use client';

import { useState, useEffect } from 'react';
import { getProfile, upsertProfile } from '@/lib/actions/profile';
import type { UserProfile } from '@/types/database';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    current_role: '',
    years_experience: 0,
    location: '',
    target_industry: '',
  });

  useEffect(() => {
    getProfile().then(p => {
      setProfile(p);
      if (p) {
        setForm({
          full_name: p.full_name ?? '',
          current_role: p.current_role ?? '',
          years_experience: p.years_experience ?? 0,
          location: p.location ?? '',
          target_industry: p.target_industry ?? '',
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertProfile({
      full_name: form.full_name,
      current_role: form.current_role,
      years_experience: Number(form.years_experience),
      location: form.location,
      target_industry: form.target_industry || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Update your profile and career preferences</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Profile Information</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Jane Smith"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Role</label>
            <input
              type="text"
              value={form.current_role}
              onChange={e => setForm(f => ({ ...f, current_role: e.target.value }))}
              placeholder="Software Engineer"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="50"
              value={form.years_experience}
              onChange={e => setForm(f => ({ ...f, years_experience: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              placeholder="San Francisco, CA"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Industry</label>
            <select
              value={form.target_industry}
              onChange={e => setForm(f => ({ ...f, target_industry: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">Select an industry</option>
              {[
                'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
                'Sales', 'Operations', 'Design', 'Data & Analytics', 'Product Management',
                'Consulting', 'Legal', 'Real Estate', 'Manufacturing', 'Non-Profit',
              ].map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {saved && (
            <span className="text-sm text-emerald-600 font-medium">✓ Changes saved</span>
          )}
          {!saved && <span />}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-base font-semibold text-red-700 mb-3">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Deleting your account will permanently remove all your skills, career paths, and learning plans. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => alert('Please contact support to delete your account.')}
          className="px-4 py-2 border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
