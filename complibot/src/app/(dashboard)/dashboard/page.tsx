'use client';
import { useAppStore } from '@/stores/app-store';
import { getScoreColor, getSeverityColor } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Clock, ArrowRight, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const FRAMEWORK_NAMES: Record<string, string> = { soc2: 'SOC 2', gdpr: 'GDPR', hipaa: 'HIPAA', iso27001: 'ISO 27001' };
const FRAMEWORK_COLORS: Record<string, string> = { soc2: 'bg-indigo-100 text-indigo-700', gdpr: 'bg-cyan-100 text-cyan-700', hipaa: 'bg-green-100 text-green-700', iso27001: 'bg-purple-100 text-purple-700' };

function ScoreGauge({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 8, c = 2 * Math.PI * r, half = c / 2;
  const filled = (score / 100) * half;
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : score >= 40 ? '#EA580C' : '#DC2626';
  return (
    <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
      <path d={`M 8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`} fill="none" stroke="#E2E8F0" strokeWidth={8} strokeLinecap="round" />
      <path d={`M 8 ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={`${filled} ${half}`} className="transition-all duration-700" />
      <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fontSize={size * 0.2} fontWeight={700} fill={color}>{score}%</text>
    </svg>
  );
}

export default function DashboardPage() {
  const { gaps, tasks, frameworkScores } = useAppStore();
  const criticalGaps = gaps.filter((g) => g.severity === 'critical' && g.status === 'open');
  const openGaps = gaps.filter((g) => g.status === 'open' || g.status === 'in_progress');
  const overdueTasks = tasks.filter((t) => t.status !== 'done' && new Date(t.due_date) < new Date());
  const overallScore = Math.round(frameworkScores.reduce((s, f) => s + f.score, 0) / frameworkScores.length);

  const radarData = frameworkScores.map((f) => ({ subject: FRAMEWORK_NAMES[f.framework], score: f.score, fullMark: 100 }));

  return (
    <div className="p-8 max-w-6xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Compliance Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Acme Corp · Last scan: 2 hours ago</p>
        </div>
        <button className="btn-primary text-sm">Run New Scan</button>
      </div>

      {/* Alerts */}
      {criticalGaps.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium text-red-800">{criticalGaps.length} critical compliance gap{criticalGaps.length > 1 ? 's' : ''} require immediate attention</p>
          </div>
          <Link href="/gaps?severity=critical" className="text-xs font-semibold text-red-700 hover:underline flex items-center gap-1">
            View now <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Score Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {frameworkScores.map((f) => (
          <div key={f.framework} className="rounded-xl border border-border bg-card p-5 text-center">
            <div className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mb-3 ${FRAMEWORK_COLORS[f.framework]}`}>
              {FRAMEWORK_NAMES[f.framework]}
            </div>
            <div className="flex justify-center mb-2">
              <ScoreGauge score={f.score} size={80} />
            </div>
            <p className="text-xs text-text-tertiary">{f.passing_controls}/{f.total_controls} controls passing</p>
            {f.critical_gaps > 0 && (
              <p className="text-xs text-red-600 mt-1 font-medium">{f.critical_gaps} critical gap{f.critical_gaps > 1 ? 's' : ''}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-text-primary mb-4">Compliance Coverage</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar name="Score" dataKey="score" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          {[
            { label: 'Overall Compliance Score', value: `${overallScore}%`, icon: Shield, color: getScoreColor(overallScore), bg: 'bg-primary/10', iconColor: 'text-primary' },
            { label: 'Open Gaps', value: openGaps.length.toString(), icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100', iconColor: 'text-orange-600' },
            { label: 'Tasks In Progress', value: tasks.filter(t => t.status !== 'done').length.toString(), icon: Clock, color: 'text-text-primary', bg: 'bg-primary/10', iconColor: 'text-primary' },
            { label: 'Controls Passing', value: `${frameworkScores.reduce((s,f) => s + f.passing_controls, 0)} of ${frameworkScores.reduce((s,f) => s + f.total_controls, 0)}`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', iconColor: 'text-green-600' },
          ].map(({ label, value, icon: Icon, color, bg, iconColor }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-tertiary">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Gaps */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text-primary">Top Priority Gaps</h2>
          <Link href="/gaps" className="text-xs text-primary hover:underline flex items-center gap-1">
            All gaps <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {gaps.filter(g => g.status !== 'resolved').slice(0, 5).map((gap) => (
            <div key={gap.id} className="flex items-center gap-4 px-5 py-4">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getSeverityColor(gap.severity)}`}>{gap.severity}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{gap.title}</p>
                <p className="text-xs text-text-tertiary">{gap.affected_system} · {FRAMEWORK_NAMES[gap.framework]}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${gap.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-surface text-text-secondary'}`}>
                {gap.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
