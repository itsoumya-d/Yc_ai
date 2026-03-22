'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Loader2,
  RefreshCw,
  Link2,
  Flame,
  Clock,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { getStripeKPIs, getQuickBooksPL, getQuickBooksAuthUrl, saveKPIsSnapshot } from '@/lib/actions/financials';
import type { KPIs, PLSummary } from '@/lib/actions/financials';
import { CSVImport } from '@/components/CSVImport';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Mock data (used as fallback / demo when Stripe/QB not connected) ──────────

const MRR_WATERFALL_DATA = [
  { name: 'Starting MRR', value: 42000, type: 'base' },
  { name: 'New MRR', value: 8500, type: 'positive' },
  { name: 'Expansion', value: 3200, type: 'positive' },
  { name: 'Churn', value: -2800, type: 'negative' },
  { name: 'Net New MRR', value: 8900, type: 'net' },
  { name: 'Ending MRR', value: 50900, type: 'base' },
];

const HEADCOUNT_DATA = [
  { month: 'Oct', engineering: 8, sales: 4, ops: 3, total: 15 },
  { month: 'Nov', engineering: 9, sales: 5, ops: 3, total: 17 },
  { month: 'Dec', engineering: 10, sales: 5, ops: 4, total: 19 },
  { month: 'Jan', engineering: 11, sales: 6, ops: 4, total: 21 },
  { month: 'Feb', engineering: 12, sales: 7, ops: 5, total: 24 },
  { month: 'Mar', engineering: 13, sales: 8, ops: 5, total: 26 },
];

const MOCK_KPIS = {
  mrr: 50900,
  arr: 610800,
  mrrGrowth: 21.1,
  payingCustomers: 318,
  newCustomers: 42,
  churnRate: 1.4,
};

const MOCK_BURN = {
  monthlyBurn: 185000,
  cashOnHand: 3200000,
  runwayMonths: 17,
};

const MOCK_NPS = 62;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtK = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

function runwayColor(months: number) {
  if (months >= 12) return 'text-emerald-600 dark:text-emerald-400';
  if (months >= 6) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function runwayBg(months: number) {
  if (months >= 12) return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
  if (months >= 6) return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
  return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
}

function npsColor(score: number) {
  if (score >= 50) return '#16a34a';
  if (score >= 0) return '#d97706';
  return '#dc2626';
}

function npsLabel(score: number) {
  if (score >= 50) return 'Excellent';
  if (score >= 30) return 'Good';
  if (score >= 0) return 'Neutral';
  return 'Poor';
}

// ─── MRR Waterfall Tooltip ───────────────────────────────────────────────────

function WaterfallTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className={val < 0 ? 'text-red-500' : 'text-emerald-500'}>
        {val < 0 ? '-' : '+'}{fmtK(Math.abs(val))}
      </p>
    </div>
  );
}

// ─── NPS Gauge ───────────────────────────────────────────────────────────────

function NpsGauge({ score }: { score: number }) {
  const angle = ((score + 100) / 200) * 180 - 90; // -100→-90deg, +100→+90deg
  const color = npsColor(score);
  const label = npsLabel(score);
  const NpsIcon = score >= 50 ? Smile : score >= 0 ? Meh : Frown;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* SVG half-circle gauge */}
      <svg viewBox="0 0 200 110" className="w-48 h-28">
        {/* Background arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {/* Color zones */}
        <path d="M 10 100 A 90 90 0 0 1 55 27" fill="none" stroke="#dc2626" strokeWidth="18" strokeLinecap="round" opacity="0.35" />
        <path d="M 55 27 A 90 90 0 0 1 145 27" fill="none" stroke="#d97706" strokeWidth="18" strokeLinecap="round" opacity="0.35" />
        <path d="M 145 27 A 90 90 0 0 1 190 100" fill="none" stroke="#16a34a" strokeWidth="18" strokeLinecap="round" opacity="0.35" />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 72 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={100 + 72 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="6" fill={color} />
        {/* Score text */}
        <text x="100" y="82" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
      <div className="flex items-center gap-1.5">
        <NpsIcon size={16} style={{ color }} />
        <span className="text-sm font-semibold" style={{ color }}>{label}</span>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
        <span><span className="text-red-500 font-medium">◾</span> Detractors</span>
        <span><span className="text-amber-500 font-medium">◾</span> Passives</span>
        <span><span className="text-emerald-500 font-medium">◾</span> Promoters</span>
      </div>
    </div>
  );
}

// ─── Section animation wrapper ────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

function Section({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      {children}
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-52 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [pl, setPl] = useState<PLSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qbUrl, setQbUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [kpiResult, plResult, qbUrlResult] = await Promise.all([
      getStripeKPIs(),
      getQuickBooksPL(),
      getQuickBooksAuthUrl(),
    ]);
    if (kpiResult.data) {
      setKpis(kpiResult.data);
      await saveKPIsSnapshot(kpiResult.data);
    }
    if (plResult.data) setPl(plResult.data);
    if (qbUrlResult.data) setQbUrl(qbUrlResult.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Use real KPIs if available, else fall back to mock data for display
  const displayKpis = kpis ?? MOCK_KPIS;
  const burn = MOCK_BURN;
  const npsScore = MOCK_NPS;

  // Build MRR waterfall bars: base bars are rendered transparent (offset trick)
  const waterfallData = MRR_WATERFALL_DATA.map((d) => ({
    name: d.name,
    display: Math.abs(d.value),
    isNegative: d.value < 0,
    type: d.type,
    value: d.value,
  }));

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <Section index={0}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {kpis ? 'Live data from Stripe and QuickBooks' : 'Demo data — connect Stripe & QuickBooks for live figures'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-card border border-border text-muted-foreground hover:text-foreground text-sm font-medium py-2 px-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </Section>

      {/* ── KPI Stat Cards ── */}
      <Section index={1}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="MRR"
            value={fmt(displayKpis.mrr)}
            icon={DollarSign}
            description={`ARR ${fmt(displayKpis.arr)}`}
            trend={{ value: displayKpis.mrrGrowth, isPositive: displayKpis.mrrGrowth >= 0 }}
            index={0}
            animateValue={false}
          />
          <StatCard
            label="MRR Growth"
            value={`${displayKpis.mrrGrowth > 0 ? '+' : ''}${displayKpis.mrrGrowth}%`}
            icon={displayKpis.mrrGrowth >= 0 ? TrendingUp : TrendingDown}
            description="vs. last month"
            index={1}
          />
          <StatCard
            label="Paying Customers"
            value={displayKpis.payingCustomers.toLocaleString()}
            icon={Users}
            description={`${displayKpis.newCustomers} new this month`}
            trend={{ value: Math.round((displayKpis.newCustomers / displayKpis.payingCustomers) * 100), isPositive: true }}
            index={2}
            animateValue
          />
          <StatCard
            label="Churn Rate"
            value={`${displayKpis.churnRate}%`}
            icon={TrendingDown}
            description="Monthly revenue churn"
            trend={{ value: displayKpis.churnRate, isPositive: false }}
            index={3}
          />
        </div>
      </Section>

      {/* ── MRR Waterfall + Burn Rate ── */}
      <Section index={2}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MRR Waterfall */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-1">MRR Waterfall</h2>
            <p className="text-xs text-muted-foreground mb-5">New, expansion, and churn breakdown</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={waterfallData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => fmtK(v)}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                />
                <Tooltip content={<WaterfallTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.3 }} />
                <Bar dataKey="display" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {waterfallData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === 'negative'
                          ? '#ef4444'
                          : entry.type === 'net'
                          ? '#6366f1'
                          : entry.type === 'base'
                          ? '#94a3b8'
                          : '#22c55e'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { color: '#94a3b8', label: 'Starting / Ending' },
                { color: '#22c55e', label: 'New & Expansion' },
                { color: '#ef4444', label: 'Churn' },
                { color: '#6366f1', label: 'Net New MRR' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-block w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Burn Rate & Runway */}
          <div className={`rounded-xl border p-6 flex flex-col justify-between ${runwayBg(burn.runwayMonths)}`}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Flame size={18} className={runwayColor(burn.runwayMonths)} />
                <h2 className="text-sm font-semibold text-foreground">Burn Rate & Runway</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Monthly Burn</p>
                  <p className="text-2xl font-bold text-foreground">{fmt(burn.monthlyBurn)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cash on Hand</p>
                  <p className="text-xl font-semibold text-foreground">{fmtK(burn.cashOnHand)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-current/20">
              <div className="flex items-center gap-2">
                <Clock size={16} className={runwayColor(burn.runwayMonths)} />
                <p className="text-xs text-muted-foreground">Runway</p>
              </div>
              <p className={`text-4xl font-extrabold mt-1 ${runwayColor(burn.runwayMonths)}`}>
                {burn.runwayMonths}
                <span className="text-xl font-semibold ml-1">mo</span>
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                {burn.runwayMonths >= 12
                  ? 'Healthy — over 12 months runway'
                  : burn.runwayMonths >= 6
                  ? 'Caution — raise or cut within 6 months'
                  : 'Critical — immediate action required'}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Headcount Trend + NPS ── */}
      <Section index={3}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Headcount Trend */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-1">Headcount Trend</h2>
            <p className="text-xs text-muted-foreground mb-5">Team growth by department</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={HEADCOUNT_DATA} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  formatter={(value) => (
                    <span style={{ color: 'var(--muted-foreground)', textTransform: 'capitalize' }}>{value}</span>
                  )}
                />
                <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: '#6366f1' }} name="Total" />
                <Line type="monotone" dataKey="engineering" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Engineering" />
                <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Sales" />
                <Line type="monotone" dataKey="ops" stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Ops" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* NPS Gauge */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center">
            <h2 className="text-sm font-semibold text-foreground mb-1 self-start w-full">NPS Score</h2>
            <p className="text-xs text-muted-foreground mb-4 self-start w-full">Net Promoter Score — last 90 days</p>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3, type: 'spring', bounce: 0.3 }}
              >
                <NpsGauge score={npsScore} />
              </motion.div>
            </AnimatePresence>
            <div className="mt-4 grid grid-cols-3 gap-3 w-full text-center">
              {[
                { label: 'Promoters', value: '68%', color: 'text-emerald-500' },
                { label: 'Passives', value: '22%', color: 'text-amber-500' },
                { label: 'Detractors', value: '10%', color: 'text-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-lg bg-muted/50 p-2">
                  <p className={`text-sm font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── QuickBooks P&L ── */}
      <Section index={4}>
        {pl ? (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
              QuickBooks — P&L Summary
            </h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-xs text-muted-foreground mb-5">{pl.startDate} — {pl.endDate}</p>
              <div className="space-y-3">
                {[
                  { label: 'Revenue', value: pl.revenue, color: 'text-emerald-600', bold: false },
                  { label: 'Gross Profit', value: pl.grossProfit, color: 'text-blue-600', bold: false },
                  { label: 'Total Expenses', value: pl.expenses, color: 'text-red-600', bold: false },
                  { label: 'Net Income', value: pl.netIncome, color: pl.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600', bold: true },
                ].map(item => (
                  <div key={item.label} className={`flex items-center justify-between ${item.bold ? 'pt-3 border-t border-border' : ''}`}>
                    <span className={`text-sm ${item.bold ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                    <span className={`font-semibold ${item.color} ${item.bold ? 'text-lg' : ''}`}>
                      {fmt(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 flex items-start gap-4">
            <Link2 size={20} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">Connect QuickBooks for P&L data</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5 mb-3">
                Pull your Profit & Loss report directly into board analytics.
              </p>
              {qbUrl && (
                <a
                  href={qbUrl}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Connect QuickBooks
                </a>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* ── Stripe banner (if not connected) ── */}
      {!kpis && (
        <Section index={5}>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 flex items-start gap-3">
            <DollarSign size={20} className="text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">Stripe not connected — showing demo data</p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                Add <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">STRIPE_SECRET_KEY</code> to your .env to see live KPIs.
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* ── CSV Import ── */}
      <Section index={6}>
        <CSVImport />
      </Section>
    </div>
  );
}
