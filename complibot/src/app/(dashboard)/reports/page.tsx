'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Download, Shield, TrendingUp } from 'lucide-react';
import { getScoreColor } from '@/lib/utils';

const HISTORY = [
  { month: 'Oct', soc2: 42, gdpr: 55, hipaa: 38, iso27001: 31 },
  { month: 'Nov', soc2: 51, gdpr: 61, hipaa: 44, iso27001: 38 },
  { month: 'Dec', soc2: 58, gdpr: 68, hipaa: 52, iso27001: 45 },
  { month: 'Jan', soc2: 68, gdpr: 74, hipaa: 61, iso27001: 55 },
];

const GAP_BY_CATEGORY = [
  { category: 'Access Control', count: 3 },
  { category: 'Encryption', count: 2 },
  { category: 'Logging', count: 1 },
  { category: 'Incident Mgmt', count: 2 },
  { category: 'Vendor Mgmt', count: 1 },
  { category: 'Data Mgmt', count: 2 },
];

export default function ReportsPage() {
  return (
    <div className="p-8 max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="text-sm text-text-secondary mt-1">Compliance progress and audit-ready reports</p>
        </div>
        <button className="btn-outline text-sm flex items-center gap-2">
          <Download className="h-4 w-4" />Export Audit Package
        </button>
      </div>

      {/* Score trend */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-text-primary mb-4">Compliance Score Over Time</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={HISTORY}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
            <Tooltip formatter={(v: number, name: string) => [`${v}%`, name.toUpperCase()]} />
            <Line type="monotone" dataKey="soc2" stroke="#6366F1" strokeWidth={2} dot={false} name="SOC 2" />
            <Line type="monotone" dataKey="gdpr" stroke="#0891B2" strokeWidth={2} dot={false} name="GDPR" />
            <Line type="monotone" dataKey="hipaa" stroke="#10B981" strokeWidth={2} dot={false} name="HIPAA" />
            <Line type="monotone" dataKey="iso27001" stroke="#8B5CF6" strokeWidth={2} dot={false} name="ISO 27001" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center text-xs">
          {[['SOC 2', '#6366F1'], ['GDPR', '#0891B2'], ['HIPAA', '#10B981'], ['ISO 27001', '#8B5CF6']].map(([name, color]) => (
            <span key={name} className="flex items-center gap-1"><span className="h-2 w-4 rounded-sm inline-block" style={{ background: color }} />{name}</span>
          ))}
        </div>
      </div>

      {/* Gaps by category */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-text-primary mb-4">Open Gaps by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={GAP_BY_CATEGORY} layout="vertical" barSize={12}>
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-text-primary mb-4">Audit Readiness</h2>
          <div className="space-y-4">
            {[
              { name: 'SOC 2 Type I', ready: true, score: 68, note: 'Est. 3 weeks to readiness' },
              { name: 'GDPR', ready: true, score: 74, note: 'Est. 2 weeks to readiness' },
              { name: 'HIPAA', ready: false, score: 61, note: 'Est. 4 weeks to readiness' },
              { name: 'ISO 27001', ready: false, score: 55, note: 'Est. 8 weeks to readiness' },
            ].map(({ name, ready, score, note }) => (
              <div key={name} className="flex items-center gap-3">
                <Shield className={`h-5 w-5 shrink-0 ${ready ? 'text-green-600' : 'text-text-tertiary'}`} />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-text-primary">{name}</p>
                    <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</span>
                  </div>
                  <p className="text-xs text-text-tertiary">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
