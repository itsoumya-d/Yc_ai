'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Neighborhood } from '@/types/database';

interface SettingsClientProps {
  neighborhood: Neighborhood;
  userEmail: string;
}

export function SettingsClient({ neighborhood, userEmail }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your neighborhood and account</p>
      </div>

      {/* Neighborhood info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Neighborhood</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
          <p className="text-sm font-medium text-gray-900">{neighborhood.name}</p>
        </div>
        {neighborhood.description && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
            <p className="text-sm text-gray-600">{neighborhood.description}</p>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Join Code</label>
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-mono font-bold tracking-wider text-gray-800">
              {neighborhood.slug?.toUpperCase()}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(neighborhood.slug?.toUpperCase() ?? '')}
              className="text-xs text-green-700 hover:text-green-800 font-medium"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Share this code so neighbors can join your neighborhood</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created</label>
          <p className="text-sm text-gray-600">
            {new Date(neighborhood.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Treasury quick link */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Treasury</h2>
        <p className="text-sm text-gray-500">
          Manage shared funds, group purchase splits, and contribution history.
        </p>
        <a
          href="/treasury"
          className="block text-center py-2 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          View Treasury →
        </a>
      </div>

      {/* Account */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Account</h2>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
          <p className="text-sm text-gray-700">{userEmail}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
