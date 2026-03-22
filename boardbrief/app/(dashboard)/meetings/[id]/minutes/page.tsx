'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  User,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

type ApprovalStatus = 'draft' | 'approved' | 'published';

interface AgendaItem {
  id: string;
  title: string;
  minutes: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
}

const SAMPLE_AGENDA: AgendaItem[] = [
  { id: '1', title: 'Call to Order & Quorum Confirmation', minutes: '' },
  { id: '2', title: 'Approval of Previous Meeting Minutes', minutes: '' },
  { id: '3', title: 'CEO Report & Business Update', minutes: '' },
  { id: '4', title: 'Financial Review — Q4 Results', minutes: '' },
  { id: '5', title: 'Strategic Initiatives Discussion', minutes: '' },
  { id: '6', title: 'Any Other Business', minutes: '' },
];

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  published: { label: 'Published', color: 'bg-green-100 text-green-800 border-green-200' },
};

export default function MeetingMinutesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<ApprovalStatus>('draft');
  const [saving, setSaving] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>(SAMPLE_AGENDA);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: '1', description: '', assignedTo: '', dueDate: '' },
  ]);

  function updateMinutes(id: string, value: string) {
    setAgendaItems((items) =>
      items.map((item) => (item.id === id ? { ...item, minutes: value } : item))
    );
  }

  function updateActionItem(id: string, field: keyof ActionItem, value: string) {
    setActionItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function addActionItem() {
    setActionItems((items) => [
      ...items,
      { id: Date.now().toString(), description: '', assignedTo: '', dueDate: '' },
    ]);
  }

  function removeActionItem(id: string) {
    setActionItems((items) => items.filter((item) => item.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  }

  function handleSubmit() {
    setStatus('approved');
    handleSave();
  }

  function handlePublish() {
    setStatus('published');
    handleSave();
  }

  const { label, color } = STATUS_CONFIG[status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/meetings/${params.id}`}
            className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meeting
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            <h1 className="font-heading text-xl font-bold text-navy-900">Meeting Minutes</h1>
            <p className="text-sm text-navy-500">Q1 Board of Directors Meeting</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>
            {label}
          </span>
          {status === 'draft' && (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              Submit for Approval
            </button>
          )}
          {status === 'approved' && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-gold-400 transition-colors"
            >
              <Send className="h-4 w-4" />
              Publish Minutes
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Meeting Meta */}
      <div className="flex items-center gap-6 rounded-xl border border-gray-200 bg-white p-4 text-sm text-navy-600">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-navy-400" />
          <span>March 15, 2026</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-navy-400" />
          <span>10:00 AM – 12:30 PM</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-navy-400" />
          <span>Company Secretary: Jane Doe</span>
        </div>
      </div>

      {/* Agenda Items & Minutes */}
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-navy-900">Agenda Items</h2>
        {agendaItems.map((item, index) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 bg-navy-50 px-5 py-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
                {index + 1}
              </span>
              <span className="font-medium text-navy-900 text-sm">{item.title}</span>
            </div>
            <div className="p-5">
              <label className="block text-xs font-medium text-navy-500 mb-2 uppercase tracking-wide">
                Minutes / Notes
              </label>
              <textarea
                value={item.minutes}
                onChange={(e) => updateMinutes(item.id, e.target.value)}
                rows={4}
                placeholder={`Record the discussion, decisions, and outcomes for "${item.title}"...`}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-navy-900 placeholder:text-gray-400 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Items */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-navy-900">Action Items</h2>
          <button
            onClick={addActionItem}
            className="flex items-center gap-1.5 rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Action
          </button>
        </div>
        <div className="p-5 space-y-4">
          {actionItems.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-3 items-start rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="col-span-5">
                <label className="block text-xs text-navy-500 mb-1">Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateActionItem(item.id, 'description', e.target.value)}
                  placeholder="Describe the action required..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-xs text-navy-500 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={item.assignedTo}
                  onChange={(e) => updateActionItem(item.id, 'assignedTo', e.target.value)}
                  placeholder="Name or role"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-navy-500 mb-1">Due Date</label>
                <input
                  type="date"
                  value={item.dueDate}
                  onChange={(e) => updateActionItem(item.id, 'dueDate', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
                />
              </div>
              <div className="col-span-1 flex items-end pb-1">
                <button
                  onClick={() => removeActionItem(item.id)}
                  disabled={actionItems.length === 1}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <span className="text-sm text-navy-500">
          Last saved: {new Date().toLocaleTimeString()}
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Minutes'}
        </button>
      </div>
    </div>
  );
}
