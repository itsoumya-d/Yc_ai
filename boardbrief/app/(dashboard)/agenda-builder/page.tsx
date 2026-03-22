'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  Plus,
  GripVertical,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
  Download,
  X,
  Loader2,
  Play,
  Pause,
  Square,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { useAiStream } from '@/lib/hooks/useAiStream';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { createClient } from '@/lib/supabase/client';

interface AgendaItem {
  id: string;
  title: string;
  presenter: string;
  duration: number;
  description: string;
  type: 'discussion' | 'approval' | 'presentation' | 'aob';
  expanded: boolean;
}

const TYPE_LABELS: Record<AgendaItem['type'], string> = {
  discussion: 'Discussion',
  approval: 'Approval',
  presentation: 'Presentation',
  aob: 'Any Other Business',
};

const TYPE_COLORS: Record<AgendaItem['type'], string> = {
  discussion: 'bg-blue-100 text-blue-700',
  approval: 'bg-amber-100 text-amber-700',
  presentation: 'bg-purple-100 text-purple-700',
  aob: 'bg-gray-100 text-gray-600',
};

const SUGGESTED_ITEMS: AgendaItem[] = [
  { id: 's1', title: 'Apologies for Absence', presenter: 'Chair', duration: 2, description: 'Record any directors unable to attend.', type: 'discussion', expanded: false },
  { id: 's2', title: 'Minutes of Previous Meeting', presenter: 'Company Secretary', duration: 5, description: 'Approve minutes from the last board meeting.', type: 'approval', expanded: false },
  { id: 's3', title: 'CEO Report', presenter: 'CEO', duration: 20, description: 'Operational update and strategic progress report.', type: 'presentation', expanded: false },
  { id: 's4', title: 'Financial Report', presenter: 'CFO', duration: 15, description: 'Review of management accounts, cash position, and forecasts.', type: 'presentation', expanded: false },
  { id: 's5', title: 'Risk Register Update', presenter: 'Risk Committee', duration: 10, description: 'Review and update the organisational risk register.', type: 'discussion', expanded: false },
  { id: 's6', title: 'Any Other Business', presenter: 'Chair', duration: 5, description: 'Items raised by directors not on the agenda.', type: 'aob', expanded: false },
];

// ── Timer Helpers ─────────────────────────────────────────────────────────────

function formatMmSs(totalSeconds: number): string {
  const s = Math.abs(totalSeconds);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

function timerColor(elapsedSeconds: number, totalAllocatedSeconds: number): string {
  if (totalAllocatedSeconds <= 0) return 'text-green-600';
  const pct = elapsedSeconds / totalAllocatedSeconds;
  if (pct < 0.75) return 'text-green-600';
  if (pct < 1.0) return 'text-amber-500';
  return 'text-red-500';
}

// Returns the index of the agenda item currently being presented based on elapsed time
function getCurrentItemIndex(items: AgendaItem[], elapsedSeconds: number): number {
  let accumulated = 0;
  for (let i = 0; i < items.length; i++) {
    accumulated += (items[i].duration || 5) * 60;
    if (elapsedSeconds < accumulated) return i;
  }
  return items.length - 1; // past all items
}

// ── Meeting Timer Panel ───────────────────────────────────────────────────────

interface MeetingTimerPanelProps {
  items: AgendaItem[];
  totalDuration: number;
  /** Called with the active item index (-1 when stopped) */
  onActiveItemChange: (index: number) => void;
}

function MeetingTimerPanel({ items, totalDuration, onActiveItemChange }: MeetingTimerPanelProps) {
  const [meetingActive, setMeetingActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paused, setPaused] = useState(false);

  const totalSeconds = totalDuration * 60;
  const currentItemIndex = meetingActive ? getCurrentItemIndex(items, elapsedSeconds) : -1;
  const overrun = elapsedSeconds > totalSeconds;
  const overrunSeconds = elapsedSeconds - totalSeconds;
  const colorClass = timerColor(elapsedSeconds, totalSeconds);

  // Tick
  useEffect(() => {
    if (!meetingActive || paused) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [meetingActive, paused]);

  // Notify parent whenever active item changes
  useEffect(() => {
    onActiveItemChange(currentItemIndex);
  }, [currentItemIndex, onActiveItemChange]);

  function handleStart() {
    setElapsedSeconds(0);
    setMeetingActive(true);
    setPaused(false);
  }

  function handleStop() {
    setMeetingActive(false);
    setPaused(false);
    setElapsedSeconds(0);
    onActiveItemChange(-1);
  }

  return (
    <div className="space-y-4">
      {/* Timer display */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4 text-center">
        <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">
          {meetingActive ? (overrun ? 'Over time by' : 'Elapsed') : 'Meeting Timer'}
        </p>
        <p className={`font-mono text-4xl font-bold tabular-nums transition-colors ${colorClass}`}>
          {meetingActive
            ? overrun
              ? `+${formatMmSs(overrunSeconds)}`
              : formatMmSs(elapsedSeconds)
            : formatMmSs(0)}
        </p>
        {meetingActive && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            of {formatMmSs(totalSeconds)} allocated
          </p>
        )}

        {/* Progress bar */}
        {meetingActive && (
          <div className="mt-3 h-2 rounded-full bg-[var(--border)] overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors ${
                overrun ? 'bg-red-500' : elapsedSeconds / totalSeconds > 0.75 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min((elapsedSeconds / totalSeconds) * 100, 100)}%` }}
              layout
            />
          </div>
        )}
      </div>

      {/* Current item indicator */}
      {meetingActive && currentItemIndex >= 0 && currentItemIndex < items.length && (
        <motion.div
          key={currentItemIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 px-3 py-2"
        >
          <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Current item
          </p>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mt-0.5 truncate">
            {items[currentItemIndex].title}
          </p>
          {items[currentItemIndex].presenter && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              {items[currentItemIndex].presenter}
            </p>
          )}
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!meetingActive ? (
          <Button
            onClick={handleStart}
            disabled={items.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            <Play className="h-3.5 w-3.5" />
            Start Meeting
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setPaused((p) => !p)}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 text-sm"
            >
              {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              {paused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              onClick={handleStop}
              variant="outline"
              className="flex items-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
            >
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgendaBuilderPage() {
  const [items, setItems] = useState<AgendaItem[]>([
    SUGGESTED_ITEMS[0],
    SUGGESTED_ITEMS[1],
    SUGGESTED_ITEMS[2],
    SUGGESTED_ITEMS[5],
  ]);
  const [meetingTitle, setMeetingTitle] = useState('Q2 Board of Directors Meeting');
  const [meetingDate, setMeetingDate] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiContext, setAiContext] = useState('');
  // Active item index driven by the meeting timer (-1 = timer not running)
  const [activeItemIndex, setActiveItemIndex] = useState<number>(-1);
  const savedMeetingIdRef = React.useRef<string | null>(null);
  const savedAgendaIdRef = React.useRef<string | null>(null);
  const [loadedExisting, setLoadedExisting] = useState(false);

  // On mount, check for existing draft meeting to avoid creating duplicates
  useEffect(() => {
    async function loadExistingDraft() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find the most recent draft meeting
      const { data: meeting } = await supabase
        .from('meetings')
        .select('id, title, scheduled_at')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!meeting) return;

      savedMeetingIdRef.current = meeting.id;
      setMeetingTitle(meeting.title || 'Untitled Meeting');
      if (meeting.scheduled_at) setMeetingDate(meeting.scheduled_at.split('T')[0]);

      // Load its agenda
      const { data: agenda } = await supabase
        .from('meeting_agendas')
        .select('id')
        .eq('meeting_id', meeting.id)
        .limit(1)
        .single();

      if (!agenda) return;
      savedAgendaIdRef.current = agenda.id;

      // Load agenda items
      const { data: agendaItems } = await supabase
        .from('agenda_items')
        .select('id, title, item_type, duration_minutes, sort_order, presenter, description')
        .eq('agenda_id', agenda.id)
        .order('sort_order', { ascending: true });

      if (agendaItems && agendaItems.length > 0) {
        const typeReverseMap: Record<string, AgendaItem['type']> = {
          discussion: 'discussion', approval: 'approval', information: 'presentation', admin: 'aob',
        };
        setItems(agendaItems.map(ai => ({
          id: ai.id,
          title: ai.title,
          presenter: ai.presenter || '',
          duration: ai.duration_minutes || 10,
          description: ai.description || '',
          type: typeReverseMap[ai.item_type] || 'discussion',
          expanded: false,
        })));
      }

      setLoadedExisting(true);
    }
    loadExistingDraft();
  }, []);

  // Auto-save agenda whenever items or meeting title change
  const { status: saveStatus, statusText: saveStatusText } = useAutoSave({
    value: { items, meetingTitle, meetingDate },
    onSave: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create meeting + agenda on first save; reuse IDs on subsequent saves
      if (!savedMeetingIdRef.current) {
        const { data: meeting } = await supabase.from('meetings').insert({
          user_id: user.id,
          title: meetingTitle || 'Untitled Meeting',
          meeting_type: 'regular',
          status: 'draft',
          scheduled_at: meetingDate ? new Date(meetingDate).toISOString() : null,
          duration_minutes: items.reduce((s, i) => s + i.duration, 0),
        }).select('id').single();
        if (!meeting) return;
        savedMeetingIdRef.current = meeting.id;

        const { data: agenda } = await supabase.from('meeting_agendas').insert({
          meeting_id: meeting.id,
          total_duration_minutes: items.reduce((s, i) => s + i.duration, 0),
        }).select('id').single();
        if (agenda) savedAgendaIdRef.current = agenda.id;
      }

      const agendaId = savedAgendaIdRef.current;
      if (!agendaId) return;

      // Replace agenda items (delete + insert for simplicity)
      await supabase.from('agenda_items').delete().eq('agenda_id', agendaId);
      if (items.length > 0) {
        const typeMap: Record<string, string> = { discussion: 'discussion', approval: 'approval', presentation: 'information', aob: 'admin' };
        await supabase.from('agenda_items').insert(
          items.map((item, idx) => ({
            agenda_id: agendaId,
            title: item.title,
            description: item.description || null,
            item_type: typeMap[item.type] ?? 'discussion',
            duration_minutes: item.duration,
            sort_order: idx,
          }))
        );
      }
    },
    delay: 2000,
  });

  const { generate, streaming, text: aiText, cancel, reset: resetAi } = useAiStream({
    onComplete: (fullText) => {
      // Parse AI text into agenda items (lines starting with numbers)
      const lines = fullText.split('\n').filter(l => l.trim());
      const parsed: AgendaItem[] = [];
      for (const line of lines) {
        const match = line.match(/^(\d+)\.\s*(.+?)(?:\s*[-–—]\s*(\d+)\s*min)?$/);
        if (match) {
          parsed.push({
            id: Date.now().toString() + parsed.length,
            title: match[2].trim(),
            presenter: '',
            duration: match[3] ? parseInt(match[3]) : 10,
            description: '',
            type: 'discussion',
            expanded: false,
          });
        }
      }
      if (parsed.length >= 3) {
        setItems(parsed);
        setShowAiPanel(false);
      }
    },
  });

  const totalDuration = items.reduce((sum, i) => sum + (i.duration || 0), 0);
  const BOARD_MEETING_MAX = 90; // minutes
  const overThreshold = totalDuration > BOARD_MEETING_MAX;

  function addItem() {
    const newItem: AgendaItem = {
      id: Date.now().toString(),
      title: 'New Agenda Item',
      presenter: '',
      duration: 10,
      description: '',
      type: 'discussion',
      expanded: true,
    };
    setItems((prev) => [...prev, newItem]);
  }

  function addSuggested(item: AgendaItem) {
    if (items.find((i) => i.id === item.id)) return;
    setItems((prev) => [...prev.slice(0, -1), { ...item, id: Date.now().toString() }, prev[prev.length - 1]]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function toggleExpanded(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, expanded: !i.expanded } : i)));
  }

  function updateItem(id: string, field: keyof AgendaItem, value: string | number | boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function handleAiSuggest() {
    resetAi();
    setShowAiPanel(true);
  }

  function handleAiGenerate() {
    generate(
      'agenda',
      `Generate a numbered board meeting agenda for: "${meetingTitle}" (${totalDuration} minutes total)`,
      aiContext || 'Standard quarterly board meeting for a startup.'
    );
  }

  // Compute per-item start-minute offset for the timeline badge
  function getItemStartMinute(index: number): number {
    return items.slice(0, index).reduce((sum, i) => sum + (i.duration || 0), 0);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main builder area */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Agenda Builder"
            description="Build and organise your board meeting agenda with AI assistance."
          />
          <AutoSaveIndicator status={saveStatus} text={saveStatusText} className="mt-1" />
        </div>

        {/* Meeting Meta */}
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Meeting Title</label>
              <Input value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Meeting Date</label>
              <Input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
            </div>
          </div>

          {/* Total time indicator */}
          <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            overThreshold
              ? 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
              : 'bg-[var(--muted)]/40 border border-[var(--border)]'
          }`}>
            <Timer className={`h-4 w-4 shrink-0 ${overThreshold ? 'text-amber-500' : 'text-[var(--muted-foreground)]'}`} />
            <span className={`font-medium ${overThreshold ? 'text-amber-700 dark:text-amber-300' : 'text-[var(--foreground)]'}`}>
              Total: {totalDuration} min
            </span>
            {overThreshold && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 ml-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {totalDuration - BOARD_MEETING_MAX} min over recommended {BOARD_MEETING_MAX}-min board limit
              </span>
            )}
          </div>
        </Card>

        {/* Agenda Items */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const startMin = getItemStartMinute(index);
            const isActive = index === activeItemIndex;
            return (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all duration-200 ${
                  isActive
                    ? 'ring-2 ring-blue-400 ring-offset-1 dark:ring-blue-500'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <GripVertical className="h-4 w-4 text-[var(--muted-foreground)] cursor-grab shrink-0" />
                  <span className="text-xs font-bold text-[var(--muted-foreground)] w-5 shrink-0">{index + 1}.</span>

                  {/* Active item pulse indicator */}
                  {isActive && (
                    <span className="flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                  )}

                  <div className="flex-1 min-w-0">
                    {item.expanded ? (
                      <Input
                        value={item.title}
                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                        className="font-medium"
                      />
                    ) : (
                      <p className={`font-medium truncate ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-[var(--foreground)]'}`}>
                        {item.title}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </span>
                  {/* Per-item time allocation + start offset */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.expanded ? (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[var(--muted-foreground)]" />
                        <Input
                          type="number"
                          min={1}
                          max={120}
                          value={item.duration}
                          onChange={(e) => updateItem(item.id, 'duration', Math.max(1, Number(e.target.value)))}
                          className="w-14 h-7 text-xs text-center px-1"
                        />
                        <span className="text-xs text-[var(--muted-foreground)]">min</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{item.duration}m</span>
                        <span className="text-[10px] opacity-60">@ {startMin}m</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => toggleExpanded(item.id)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                    {item.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button onClick={() => removeItem(item.id)} className="text-[var(--muted-foreground)] hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {item.expanded && (
                  <div className="border-t border-[var(--border)] px-4 pb-4 pt-3 space-y-3 bg-[var(--card)]">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Presenter</label>
                        <Input
                          value={item.presenter}
                          onChange={(e) => updateItem(item.id, 'presenter', e.target.value)}
                          placeholder="Name or role"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Duration (min)</label>
                        <Input
                          type="number"
                          min={1}
                          max={120}
                          value={item.duration}
                          onChange={(e) => updateItem(item.id, 'duration', Math.max(1, Number(e.target.value)))}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Type</label>
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(item.id, 'type', e.target.value as AgendaItem['type'])}
                          className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none"
                        >
                          {Object.entries(TYPE_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Notes / Description</label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Supporting notes for this agenda item..."
                        className="text-sm"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Add Item / AI Button */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={addItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          <Button onClick={handleAiSuggest} className="flex items-center gap-2 bg-navy-900 text-white hover:bg-navy-800">
            <Sparkles className="h-4 w-4" />
            AI Suggest Agenda
          </Button>
        </div>

        {/* AI Streaming Panel */}
        {showAiPanel && (
          <Card className="overflow-hidden border-navy-200 dark:border-navy-700">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-navy-50 dark:bg-navy-900/30 px-5 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-navy-600 dark:text-navy-400" />
                <span className="text-sm font-semibold text-navy-900 dark:text-navy-100">AI Agenda Generator</span>
              </div>
              <button
                onClick={() => { cancel(); setShowAiPanel(false); }}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Additional Context (optional)
                </label>
                <Textarea
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  placeholder="e.g. Focus on Series A fundraising update, new hires, product roadmap review..."
                  rows={2}
                  className="text-sm"
                  disabled={streaming}
                />
              </div>

              {aiText && (
                <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4 font-mono text-xs text-[var(--foreground)] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {aiText}
                  {streaming && <span className="inline-block w-1.5 h-3.5 bg-navy-500 animate-pulse ml-0.5 align-middle" />}
                </div>
              )}

              <div className="flex items-center gap-3">
                {!streaming ? (
                  <Button
                    onClick={handleAiGenerate}
                    className="flex items-center gap-2 bg-navy-900 text-white hover:bg-navy-800"
                  >
                    <Sparkles className="h-4 w-4" />
                    {aiText ? 'Regenerate' : 'Generate Agenda'}
                  </Button>
                ) : (
                  <Button onClick={cancel} variant="outline" className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Stop Generation
                  </Button>
                )}
                {aiText && !streaming && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Agenda parsed — items updated above
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Sidebar: Meeting Timer + summary + suggestions */}
      <div className="w-72 shrink-0 border-l border-[var(--border)] overflow-auto p-5 space-y-5">
        {/* Meeting Timer */}
        <div>
          <h3 className="font-heading text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
            <Timer className="h-4 w-4 text-[var(--muted-foreground)]" />
            Meeting Timer
          </h3>
          <MeetingTimerPanel
            items={items}
            totalDuration={totalDuration}
            onActiveItemChange={setActiveItemIndex}
          />
        </div>

        {/* Summary */}
        <div>
          <h3 className="font-heading text-sm font-semibold text-[var(--foreground)] mb-3">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Items</span>
              <span className="font-medium text-[var(--foreground)]">{items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Total Duration</span>
              <span className={`font-medium ${overThreshold ? 'text-amber-500' : 'text-[var(--foreground)]'}`}>
                {totalDuration} min
                {overThreshold && <AlertTriangle className="inline h-3 w-3 ml-1 text-amber-500" />}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Presentations</span>
              <span className="font-medium text-[var(--foreground)]">{items.filter((i) => i.type === 'presentation').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Approvals</span>
              <span className="font-medium text-[var(--foreground)]">{items.filter((i) => i.type === 'approval').length}</span>
            </div>
          </div>

          {/* Per-item timeline strip */}
          {items.length > 0 && (
            <div className="mt-3 space-y-1">
              {items.map((item, idx) => {
                const widthPct = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0;
                const typeColorMap: Record<AgendaItem['type'], string> = {
                  presentation: 'bg-purple-400',
                  approval: 'bg-amber-400',
                  discussion: 'bg-blue-400',
                  aob: 'bg-gray-400',
                };
                const isActive = idx === activeItemIndex;
                return (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className={`text-[10px] w-4 text-right ${isActive ? 'text-blue-500 font-bold' : 'text-[var(--muted-foreground)]'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-[var(--border)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.04 }}
                        className={`h-full rounded-full ${typeColorMap[item.type]} ${isActive ? 'ring-1 ring-blue-500 ring-offset-0' : ''}`}
                      />
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] w-8 text-right">{item.duration}m</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div>
          <h3 className="font-heading text-sm font-semibold text-[var(--foreground)] mb-3">Quick Add</h3>
          <div className="space-y-2">
            {SUGGESTED_ITEMS.map((s) => (
              <button
                key={s.id}
                onClick={() => addSuggested(s)}
                className="w-full text-left rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-[var(--muted-foreground)]">{s.duration} min · {TYPE_LABELS[s.type]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Export */}
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 text-sm"
          disabled={!savedMeetingIdRef.current}
          onClick={() => {
            if (savedMeetingIdRef.current) {
              window.open(`/api/meetings/${savedMeetingIdRef.current}/pdf`, '_blank');
            }
          }}
        >
          <Download className="h-4 w-4" />
          Export as PDF
        </Button>
      </div>
    </div>
  );
}
