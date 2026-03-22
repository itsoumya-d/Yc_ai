'use client';

import { useState } from 'react';
import { Plus, Send, Clock, CheckCircle2, Users, BarChart3, ChevronRight, FileText } from 'lucide-react';

interface Update {
  id: string;
  title: string;
  status: 'Draft' | 'Sent' | 'Scheduled';
  date: string;
  recipients: number;
  openRate?: number;
}

const UPDATES: Update[] = [
  { id: '1', title: 'Q4 2025 Performance Summary', status: 'Sent', date: 'Jan 15, 2026', recipients: 12, openRate: 92 },
  { id: '2', title: 'Q1 2026 Strategic Initiatives', status: 'Sent', date: 'Feb 1, 2026', recipients: 12, openRate: 85 },
  { id: '3', title: 'March Board Prep Materials', status: 'Scheduled', date: 'Mar 10, 2026', recipients: 8 },
  { id: '4', title: 'Capital Raise Update', status: 'Draft', date: 'Mar 7, 2026', recipients: 0 },
];

const statusConfig = { Draft: { color: 'text-yellow-600 bg-yellow-50', icon: FileText }, Sent: { color: 'text-green-600 bg-green-50', icon: CheckCircle2 }, Scheduled: { color: 'text-blue-600 bg-blue-50', icon: Clock } };

export default function InvestorUpdatesPage() {
  const [filter, setFilter] = useState<'All' | 'Draft' | 'Sent' | 'Scheduled'>('All');
  const filtered = filter === 'All' ? UPDATES : UPDATES.filter(u => u.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-text-primary">Investor Updates</h1><p className="text-sm text-text-secondary mt-1">Keep your investors informed with regular updates.</p></div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90"><Plus className="h-4 w-4" /> New Update</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5"><div className="flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><Send className="h-5 w-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-text-primary">24</p><p className="text-sm text-text-secondary">Updates Sent</p></div></div></div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5"><div className="flex items-center gap-3"><div className="p-2 bg-green-50 rounded-lg"><Users className="h-5 w-5 text-green-600" /></div><div><p className="text-2xl font-bold text-text-primary">12</p><p className="text-sm text-text-secondary">Active Investors</p></div></div></div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5"><div className="flex items-center gap-3"><div className="p-2 bg-purple-50 rounded-lg"><BarChart3 className="h-5 w-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-text-primary">89%</p><p className="text-sm text-text-secondary">Avg Open Rate</p></div></div></div>
      </div>

      <div className="flex gap-2">{(['All', 'Draft', 'Sent', 'Scheduled'] as const).map(f => (
        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary'}`}>{f}</button>
      ))}</div>

      <div className="space-y-3">{filtered.map(update => {
        const config = statusConfig[update.status];
        const Icon = config.icon;
        return (
          <div key={update.id} className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${config.color.split(' ')[1]}`}><Icon className={`h-5 w-5 ${config.color.split(' ')[0]}`} /></div>
                <div><h3 className="font-semibold text-text-primary">{update.title}</h3><p className="text-sm text-text-secondary mt-0.5">{update.date} · {update.recipients > 0 ? `${update.recipients} recipients` : 'No recipients yet'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                {update.openRate && <span className="text-sm text-green-600 font-medium">{update.openRate}% opened</span>}
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${config.color}`}>{update.status}</span>
                <ChevronRight className="h-4 w-4 text-text-tertiary" />
              </div>
            </div>
          </div>
        );
      })}</div>
    </div>
  );
}
