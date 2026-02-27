'use client';

import { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { formatDate } from '@/lib/utils';
import { Search, Shield, User, Award, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MemberRole } from '@/types';

const ROLE_OPTIONS: { value: MemberRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'member', label: 'Member' },
];

const roleColors: Record<MemberRole, string> = {
  admin: 'error',
  moderator: 'warning',
  member: 'default',
};

const roleIcons: Record<MemberRole, typeof Shield> = {
  admin: Shield,
  moderator: Award,
  member: User,
};

export default function MembersPage() {
  const { members } = useAppStore();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<MemberRole | 'all'>('all');

  const filtered = members.filter((m) => {
    if (role !== 'all' && m.role !== role) return false;
    if (query && !m.name.toLowerCase().includes(query.toLowerCase()) && !m.email.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Members</h1>
        <p className="text-sm text-text-secondary mt-1">{members.length} community members</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search members…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input pl-9 w-full"
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="input min-w-36">
          {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['admin', 'moderator', 'member'] as MemberRole[]).map((r) => {
          const count = members.filter((m) => m.role === r).length;
          const Icon = roleIcons[r];
          return (
            <div key={r} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                r === 'admin' ? 'bg-red-100 dark:bg-red-900/30' :
                r === 'moderator' ? 'bg-amber-100 dark:bg-amber-900/30' :
                'bg-primary/10'
              }`}>
                <Icon className={`h-4 w-4 ${
                  r === 'admin' ? 'text-red-600' :
                  r === 'moderator' ? 'text-amber-600' :
                  'text-primary'
                }`} />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{count}</p>
                <p className="text-xs text-text-tertiary capitalize">{r}s</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="px-5 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Member</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Role</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Voting Power</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Activity</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => {
              const Icon = roleIcons[m.role];
              return (
                <tr key={m.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                        {m.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{m.name}</p>
                        <p className="text-xs text-text-tertiary">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={roleColors[m.role] as any}>
                      <Icon className="mr-1 h-3 w-3 inline" />
                      {m.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-surface overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(m.voting_power / 100) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{m.voting_power}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs text-text-secondary">{m.proposals_created} proposals</p>
                    <p className="text-xs text-text-tertiary">{m.votes_cast} votes cast</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{formatDate(m.joined_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
