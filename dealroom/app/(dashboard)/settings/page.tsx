'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [fiscalMonth, setFiscalMonth] = useState('1');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Settings are stored in localStorage for now (could be moved to a user_settings table)
    localStorage.setItem('dealroom_currency', currency);
    localStorage.setItem('dealroom_fiscal_month', fiscalMonth);
    await new Promise(r => setTimeout(r, 400));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your DealRoom workspace</p>
      </div>

      {/* Pipeline settings */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Pipeline Preferences</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Fiscal Year Start Month</label>
            <select
              value={fiscalMonth}
              onChange={e => setFiscalMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
            >
              {[
                ['1', 'January'], ['2', 'February'], ['3', 'March'], ['4', 'April'],
                ['5', 'May'], ['6', 'June'], ['7', 'July'], ['8', 'August'],
                ['9', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
              ].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {saved ? <span className="text-sm text-emerald-600 font-medium">✓ Saved</span> : <span />}
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-violet-700 text-white text-sm font-semibold rounded-lg hover:bg-violet-800 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Pipeline stages info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Pipeline Stages</h2>
        <div className="space-y-2">
          {[
            { stage: 'Prospecting', description: 'Initial research and lead identification', color: 'bg-gray-400' },
            { stage: 'Qualification', description: 'Assessing fit, budget, authority, need, timeline', color: 'bg-blue-500' },
            { stage: 'Proposal', description: 'Sending quotes and formal proposals', color: 'bg-yellow-500' },
            { stage: 'Negotiation', description: 'Discussing terms and conditions', color: 'bg-orange-500' },
            { stage: 'Closed Won', description: 'Deal successfully closed', color: 'bg-emerald-500' },
            { stage: 'Closed Lost', description: 'Deal lost to competitor or no decision', color: 'bg-red-500' },
          ].map(({ stage, description, color }) => (
            <div key={stage} className="flex items-center gap-3 py-2">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
              <div>
                <span className="text-sm font-medium text-gray-900">{stage}</span>
                <span className="text-xs text-gray-400 ml-2">{description}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Pipeline stages are fixed. Contact support to customize stages for your team.</p>
      </div>

      {/* Account */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>
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
