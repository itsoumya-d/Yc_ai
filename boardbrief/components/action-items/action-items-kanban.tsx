'use client';

import { useState } from 'react';
import { updateActionItemStatus, createBulkActionItems } from '@/lib/actions/action-items';
import { extractActionItemsFromNotes, type ExtractedActionItem } from '@/lib/actions/ai-meetings';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { CalendarClock, User, Sparkles, Plus, ChevronDown, Loader2 } from 'lucide-react';
import type { ActionItem, ActionItemStatus } from '@/types/database';

const COLUMNS: Array<{
  id: ActionItemStatus;
  label: string;
  headerColor: string;
  dotColor: string;
  dropHighlight: string;
  countBadge: string;
}> = [
  {
    id: 'open',
    label: 'Open',
    headerColor: 'text-blue-700',
    dotColor: 'bg-blue-400',
    dropHighlight: 'ring-2 ring-blue-300 bg-blue-50/40',
    countBadge: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    headerColor: 'text-amber-700',
    dotColor: 'bg-amber-400',
    dropHighlight: 'ring-2 ring-amber-300 bg-amber-50/40',
    countBadge: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'completed',
    label: 'Completed',
    headerColor: 'text-emerald-700',
    dotColor: 'bg-emerald-400',
    dropHighlight: 'ring-2 ring-emerald-300 bg-emerald-50/40',
    countBadge: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'deferred',
    label: 'Deferred',
    headerColor: 'text-slate-600',
    dotColor: 'bg-slate-400',
    dropHighlight: 'ring-2 ring-slate-300 bg-slate-50/40',
    countBadge: 'bg-slate-100 text-slate-600',
  },
];

interface ActionItemsKanbanProps {
  initialItems: ActionItem[];
}

export function ActionItemsKanban({ initialItems }: ActionItemsKanbanProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<ActionItemStatus | null>(null);

  // AI extraction panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedActionItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  const getColItems = (status: ActionItemStatus) =>
    items.filter(i => i.status === status);

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  const onDragStart = (id: string) => setDraggingId(id);

  const onDragOver = (e: React.DragEvent, colId: ActionItemStatus) => {
    e.preventDefault();
    if (overColumn !== colId) setOverColumn(colId);
  };

  const onDrop = async (colId: ActionItemStatus) => {
    const id = draggingId;
    setDraggingId(null);
    setOverColumn(null);
    if (!id) return;

    const item = items.find(i => i.id === id);
    if (!item || item.status === colId) return;

    // Optimistic update
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: colId } : i));
    await updateActionItemStatus(id, colId);
  };

  const onDragEnd = () => {
    setDraggingId(null);
    setOverColumn(null);
  };

  // ── AI Extraction ─────────────────────────────────────────────────────────
  const handleExtract = async () => {
    if (!notes.trim()) return;
    setExtracting(true);
    setExtractError(null);
    setExtracted([]);
    const result = await extractActionItemsFromNotes(notes);
    setExtracting(false);
    if (result.error || !result.data) {
      setExtractError(result.error ?? 'Extraction failed');
      return;
    }
    setExtracted(result.data);
    setSelected(new Set(result.data.map((_, i) => i)));
  };

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleSave = async () => {
    const toAdd = extracted.filter((_, i) => selected.has(i));
    if (!toAdd.length) return;
    setSaving(true);
    const result = await createBulkActionItems(toAdd);
    setSaving(false);
    if (result.data) {
      setItems(prev => [...result.data!, ...prev]);
      setExtracted([]);
      setSelected(new Set());
      setNotes('');
      setPanelOpen(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* ── AI Extraction Panel ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-white shadow-[var(--shadow-card)]">
        <button
          onClick={() => setPanelOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--muted)] transition-colors text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-gold-600" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[var(--foreground)]">
                AI Extraction
              </span>
              <span className="text-sm text-[var(--muted-foreground)] ml-2">
                Paste meeting notes to auto-generate action items
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[var(--muted-foreground)] transition-transform duration-200 shrink-0 ${panelOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {panelOpen && (
          <div className="px-5 pb-5 pt-4 border-t border-[var(--border)] bg-[var(--muted)] space-y-3">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Paste your meeting transcript, minutes, or notes here…"
              rows={5}
              className="w-full rounded-lg border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-navy-800/20 focus:border-navy-800/30"
            />

            <button
              onClick={handleExtract}
              disabled={!notes.trim() || extracting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {extracting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting…</>
                : <><Sparkles className="w-3.5 h-3.5" /> Extract Action Items</>
              }
            </button>

            {extractError && (
              <p className="text-sm text-red-600">{extractError}</p>
            )}

            {extracted.length > 0 && (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  {extracted.length} items found — select which to add
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {extracted.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleSelect(i)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-100 ${
                        selected.has(i)
                          ? 'border-navy-800 bg-white shadow-[var(--shadow-card)]'
                          : 'border-transparent bg-white/50 opacity-60 hover:opacity-80'
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          selected.has(i) ? 'border-navy-800 bg-navy-800' : 'border-slate-300'
                        }`}
                      >
                        {selected.has(i) && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--foreground)] leading-snug">{item.title}</p>
                        {item.assignee_name && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" /> {item.assignee_name}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>

                      <Badge variant={item.priority} className="shrink-0 mt-0.5">{item.priority}</Badge>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={!selected.size || saving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…</>
                    : <><Plus className="w-3.5 h-3.5" /> Add {selected.size} Item{selected.size !== 1 ? 's' : ''} to Open</>
                  }
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Kanban Board ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colItems = getColItems(col.id);
          const isOver = overColumn === col.id && draggingId !== null;

          return (
            <div
              key={col.id}
              onDragOver={e => onDragOver(e, col.id)}
              onDrop={() => onDrop(col.id)}
              onDragLeave={e => {
                // Only clear if truly leaving the column (not entering a child)
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn(null);
                }
              }}
              className={`flex flex-col rounded-xl border border-[var(--border)] bg-white min-h-[420px] transition-all duration-150 ${isOver ? col.dropHighlight : ''}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className={`text-sm font-semibold ${col.headerColor}`}>{col.label}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.countBadge}`}>
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-2">
                {colItems.map(item => {
                  const overdue =
                    item.due_date &&
                    item.status !== 'completed' &&
                    new Date(item.due_date) < new Date();
                  const isDragging = draggingId === item.id;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => onDragStart(item.id)}
                      onDragEnd={onDragEnd}
                      className={`bg-white rounded-lg border border-[var(--border)] p-3.5 cursor-grab active:cursor-grabbing shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] select-none transition-all duration-150 ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
                    >
                      <p className="text-sm font-medium text-[var(--foreground)] leading-snug">{item.title}</p>

                      {item.description && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <Badge variant={item.priority}>{item.priority}</Badge>
                      </div>

                      {(item.assignee_name || item.due_date) && (
                        <div className="mt-2 flex items-center gap-3 text-xs text-[var(--muted-foreground)] flex-wrap">
                          {item.assignee_name && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[100px]">{item.assignee_name}</span>
                            </div>
                          )}
                          {item.due_date && (
                            <div className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                              <CalendarClock className="w-3 h-3 shrink-0" />
                              <span>{formatDate(item.due_date)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Empty drop target */}
                {colItems.length === 0 && (
                  <div className={`flex items-center justify-center h-20 rounded-lg border-2 border-dashed transition-colors ${isOver ? 'border-navy-300 bg-navy-50/30' : 'border-[var(--border)]'}`}>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {isOver ? 'Release to move here' : 'Drop items here'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
