'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createKpi, updateKpi, deleteKpi, addKpiEntry } from '@/lib/actions/kpis';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import type { KpiWithEntries, KpiCategory, KpiUnit, KpiFrequency } from '@/lib/actions/kpis';

const CATEGORIES: { value: KpiCategory; label: string; color: string }[] = [
  { value: 'financial',   label: 'Financial',   color: 'bg-emerald-100 text-emerald-800' },
  { value: 'operational', label: 'Operational', color: 'bg-blue-100 text-blue-800' },
  { value: 'growth',      label: 'Growth',      color: 'bg-purple-100 text-purple-800' },
  { value: 'other',       label: 'Other',       color: 'bg-gray-100 text-gray-700' },
];

const UNITS: { value: KpiUnit; label: string; prefix?: string; suffix?: string }[] = [
  { value: 'number',     label: 'Number' },
  { value: 'percentage', label: 'Percentage', suffix: '%' },
  { value: 'currency',   label: 'Currency',   prefix: '$' },
  { value: 'ratio',      label: 'Ratio',      suffix: 'x' },
];

const FREQUENCIES: { value: KpiFrequency; label: string }[] = [
  { value: 'weekly',    label: 'Weekly' },
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual',    label: 'Annual' },
];

function formatValue(value: number | null, unit: KpiUnit): string {
  if (value == null) return '—';
  const u = UNITS.find((u) => u.value === unit);
  const formatted = unit === 'currency'
    ? value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : unit === 'ratio'
    ? value.toFixed(2)
    : unit === 'percentage'
    ? value.toFixed(1)
    : value.toLocaleString();
  return `${u?.prefix ?? ''}${formatted}${u?.suffix ?? ''}`;
}

function Trend({ current, previous }: { current: number | null; previous: number | null }) {
  if (current == null || previous == null || previous === 0) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  const up  = pct > 0;
  const Icon = Math.abs(pct) < 0.5 ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-medium', up ? 'text-green-600' : pct === 0 ? 'text-gray-500' : 'text-red-500')}>
      <Icon className="h-3 w-3" />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function ProgressBar({ value, target }: { value: number | null; target: number | null }) {
  if (value == null || target == null || target === 0) return null;
  const pct = Math.min(100, (value / target) * 100);
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
      <div
        className={cn('h-full rounded-full transition-all', pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-gold-500' : 'bg-blue-500')}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── KPI Form ────────────────────────────────────────────────────────────────

interface KpiFormProps {
  initial?: KpiWithEntries;
  onDone: () => void;
}

function KpiForm({ initial, onDone }: KpiFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const result = initial
      ? await updateKpi(initial.id, fd)
      : await createKpi(fd);
    setSaving(false);
    if (result.error) { toast({ title: result.error, variant: 'destructive' }); return; }
    toast({ title: initial ? 'KPI updated' : 'KPI created' });
    onDone();
  }

  const fieldClass = 'block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20';
  const labelClass = 'mb-1 block text-xs font-medium text-[var(--muted-foreground)]';

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>KPI Name *</label>
          <input name="name" required defaultValue={initial?.name} placeholder="e.g. Monthly Recurring Revenue" className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <input name="description" defaultValue={initial?.description ?? ''} placeholder="What this metric measures" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={initial?.category ?? 'financial'} className={fieldClass}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <select name="unit" defaultValue={initial?.unit ?? 'number'} className={fieldClass}>
            {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Target Value</label>
          <input name="target_value" type="number" step="any" defaultValue={initial?.target_value ?? ''} placeholder="e.g. 100000" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Current Value</label>
          <input name="current_value" type="number" step="any" defaultValue={initial?.current_value ?? ''} placeholder="e.g. 78000" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Reporting Frequency</label>
          <select name="frequency" defaultValue={initial?.frequency ?? 'monthly'} className={fieldClass}>
            {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Owner</label>
          <input name="owner_name" defaultValue={initial?.owner_name ?? ''} placeholder="e.g. CFO" className={fieldClass} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={saving} className="bg-gold-500 text-navy-900 hover:bg-gold-400">
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add KPI'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

// ─── Log Entry Form ───────────────────────────────────────────────────────────

function LogEntryForm({ kpiId, unit, onDone }: { kpiId: string; unit: KpiUnit; onDone: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const val = parseFloat(fd.get('value') as string);
    if (isNaN(val)) return;
    setSaving(true);
    const result = await addKpiEntry(
      kpiId,
      val,
      (fd.get('notes') as string)?.trim() || undefined,
      (fd.get('recorded_at') as string) || undefined
    );
    setSaving(false);
    if (result.error) { toast({ title: result.error, variant: 'destructive' }); return; }
    toast({ title: 'Entry logged' });
    onDone();
  }

  const fieldClass = 'block w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-gold-400 focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2 rounded-lg bg-[var(--muted)] p-3">
      <div className="flex-1 min-w-[120px]">
        <input name="value" type="number" step="any" required placeholder={`New ${unit} value`} className={fieldClass} />
      </div>
      <div className="flex-1 min-w-[120px]">
        <input name="recorded_at" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={fieldClass} />
      </div>
      <div className="w-full">
        <input name="notes" placeholder="Notes (optional)" className={fieldClass} />
      </div>
      <Button type="submit" size="sm" disabled={saving} className="bg-gold-500 text-navy-900 hover:bg-gold-400">
        {saving ? 'Saving…' : 'Log'}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onDone}>Cancel</Button>
    </form>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ kpi, onRefresh }: { kpi: KpiWithEntries; onRefresh: () => void }) {
  const { toast } = useToast();
  const [editing,   setEditing]   = useState(false);
  const [logging,   setLogging]   = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const cat   = CATEGORIES.find((c) => c.value === kpi.category);
  const pct   = kpi.target_value && kpi.current_value != null
    ? Math.min(100, Math.round((kpi.current_value / kpi.target_value) * 100))
    : null;

  async function handleDelete() {
    if (!confirm(`Delete KPI "${kpi.name}"?`)) return;
    setDeleting(true);
    const result = await deleteKpi(kpi.id);
    if (result.error) { toast({ title: result.error, variant: 'destructive' }); setDeleting(false); return; }
    toast({ title: 'KPI deleted' });
    onRefresh();
  }

  const recentEntries = [...(kpi.entries ?? [])].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()).slice(0, 5);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-[var(--foreground)]">{kpi.name}</h3>
            {cat && (
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', cat.color)}>
                {cat.label}
              </span>
            )}
            {kpi.owner_name && (
              <span className="text-[10px] text-[var(--muted-foreground)]">• {kpi.owner_name}</span>
            )}
          </div>
          {kpi.description && (
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{kpi.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button onClick={() => { setLogging((v) => !v); setEditing(false); }} className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]" title="Log entry">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => { setEditing((v) => !v); setLogging(false); }} className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]" title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleDelete} disabled={deleting} className="rounded p-1.5 text-[var(--muted-foreground)] hover:bg-red-50 hover:text-red-500" title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Values row */}
      <div className="mt-3 flex items-end gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Current</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {formatValue(kpi.current_value, kpi.unit)}
          </p>
          <Trend current={kpi.current_value} previous={kpi.previous_value} />
        </div>
        {kpi.target_value != null && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Target</p>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {formatValue(kpi.target_value, kpi.unit)}
            </p>
            {pct != null && (
              <p className={cn('text-[10px]', pct >= 100 ? 'text-emerald-600' : pct >= 70 ? 'text-gold-600' : 'text-blue-600')}>
                {pct}% to target
              </p>
            )}
          </div>
        )}
        <div className="ml-auto text-right">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">Frequency</p>
          <p className="text-xs text-[var(--foreground)] capitalize">{kpi.frequency}</p>
        </div>
      </div>

      <ProgressBar value={kpi.current_value} target={kpi.target_value} />

      {logging && (
        <LogEntryForm kpiId={kpi.id} unit={kpi.unit} onDone={() => setLogging(false)} />
      )}

      {editing && (
        <KpiForm initial={kpi} onDone={() => setEditing(false)} />
      )}

      {/* History toggle */}
      {recentEntries.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {recentEntries.length} entr{recentEntries.length === 1 ? 'y' : 'ies'}
          </button>
          {expanded && (
            <div className="mt-2 space-y-1 border-t border-[var(--border)] pt-2">
              {recentEntries.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-[var(--muted-foreground)]">
                    {new Date(e.recorded_at).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {formatValue(e.value, kpi.unit)}
                  </span>
                  {e.notes && <span className="max-w-[120px] truncate text-[var(--muted-foreground)]">{e.notes}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface KpiTrackerProps {
  initialKpis: KpiWithEntries[];
}

export function KpiTracker({ initialKpis }: KpiTrackerProps) {
  const [kpis,        setKpis]        = useState(initialKpis);
  const [showForm,    setShowForm]    = useState(false);
  const [filterCat,   setFilterCat]   = useState<KpiCategory | 'all'>('all');
  const [refreshKey,  setRefreshKey]  = useState(0);

  // Force page-level re-fetch on refresh
  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    // Next.js revalidatePath on server will repopulate on next navigation
  }

  const filtered = kpis.filter((k) => filterCat === 'all' || k.category === filterCat);
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter((k) => k.category === cat.value);
    if (items.length > 0) acc[cat.value] = items;
    return acc;
  }, {} as Record<KpiCategory, KpiWithEntries[]>);

  const totalKpis  = kpis.length;
  const onTarget   = kpis.filter((k) => k.current_value != null && k.target_value != null && k.current_value >= k.target_value).length;
  const atRisk     = kpis.filter((k) => k.current_value != null && k.target_value != null && k.current_value / k.target_value < 0.7).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total KPIs', value: totalKpis, color: 'text-[var(--foreground)]' },
          { label: 'On Target',  value: onTarget,  color: 'text-emerald-600' },
          { label: 'At Risk',    value: atRisk,     color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
            <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs + Add button */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1">
          {[{ value: 'all', label: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.value}
              onClick={() => setFilterCat(c.value as KpiCategory | 'all')}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filterCat === c.value
                  ? 'bg-navy-900 text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="bg-gold-500 text-navy-900 hover:bg-gold-400"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add KPI
        </Button>
      </div>

      {/* Add KPI form */}
      {showForm && <KpiForm onDone={() => setShowForm(false)} />}

      {/* KPI groups */}
      {totalKpis === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-[var(--border)] py-16">
          <BarChart3 className="h-12 w-12 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">No KPIs yet</p>
          <p className="text-xs text-[var(--muted-foreground)]">Add your first KPI to start tracking board-level metrics</p>
          <Button size="sm" onClick={() => setShowForm(true)} className="bg-gold-500 text-navy-900 hover:bg-gold-400">
            <Plus className="mr-1 h-4 w-4" />
            Add First KPI
          </Button>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, items]) => {
          const catMeta = CATEGORIES.find((c) => c.value === cat);
          return (
            <section key={cat}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {catMeta?.label ?? cat}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((kpi) => (
                  <KpiCard key={kpi.id} kpi={kpi} onRefresh={handleRefresh} />
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
