'use client';

import { useState } from 'react';
import { Plus, Search, Shield, Mail, MoreVertical, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

const MEMBERS = [
  { id: '1', name: 'Alex Johnson', email: 'alex@company.com', role: 'Admin', proposals: 34, status: 'Active', avatar: 'AJ' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Editor', proposals: 21, status: 'Active', avatar: 'SC' },
  { id: '3', name: 'Mike Williams', email: 'mike@company.com', role: 'Viewer', proposals: 8, status: 'Active', avatar: 'MW' },
  { id: '4', name: 'Emily Rodriguez', email: 'emily@company.com', role: 'Editor', proposals: 15, status: 'Invited', avatar: 'ER' },
];

const roleColors = { Admin: 'bg-purple-50 text-purple-700', Editor: 'bg-blue-50 text-blue-700', Viewer: 'bg-gray-100 text-gray-700' };

export default function TeamPage() {
  const t = useTranslations('team');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1><p className="text-sm text-text-secondary mt-1">{t('description')}</p></div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90"><UserPlus className="h-4 w-4" /> {t('inviteMember')}</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5"><p className="text-2xl font-bold text-text-primary">{MEMBERS.length}</p><p className="text-sm text-text-secondary">{t('teamMembers')}</p></div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5"><p className="text-2xl font-bold text-text-primary">{MEMBERS.filter(m => m.status === 'Active').length}</p><p className="text-sm text-text-secondary">{t('active')}</p></div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5"><p className="text-2xl font-bold text-text-primary">{MEMBERS.reduce((a, m) => a + m.proposals, 0)}</p><p className="text-sm text-text-secondary">{t('totalProposals')}</p></div>
      </div>

      <div className="bg-bg-surface border border-border-default rounded-xl overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border-default bg-bg-base/50"><th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">{t('member')}</th><th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">{t('role')}</th><th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">{t('proposals')}</th><th className="text-left px-6 py-3 text-xs font-medium text-text-secondary">{t('status')}</th><th className="px-6 py-3"></th></tr></thead>
          <tbody>{MEMBERS.map(m => (
            <tr key={m.id} className="border-b last:border-0 border-border-default hover:bg-bg-base/30">
              <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">{m.avatar}</div><div><p className="font-medium text-text-primary">{m.name}</p><p className="text-xs text-text-secondary">{m.email}</p></div></div></td>
              <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-md text-xs font-medium ${roleColors[m.role as keyof typeof roleColors]}`}>{m.role}</span></td>
              <td className="px-6 py-4 text-sm text-text-primary">{m.proposals}</td>
              <td className="px-6 py-4"><span className={`text-xs font-medium ${m.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>{m.status}</span></td>
              <td className="px-6 py-4"><button className="p-1 hover:bg-bg-base rounded" aria-label="Team member options"><MoreVertical className="h-4 w-4 text-text-tertiary" /></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
