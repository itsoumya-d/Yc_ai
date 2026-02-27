'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { updateControlStatus } from '@/lib/actions/controls';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Clock, MinusCircle } from 'lucide-react';
import type { Control, ControlStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface ControlListProps {
  controlsByCategory: Record<string, Control[]>;
  onUpdate?: () => void;
}

const statusConfig: Record<ControlStatus, {
  icon: React.ComponentType<{ className?: string }>;
  variant: 'success' | 'default' | 'warning' | 'outline';
  label: string;
  iconClass: string;
}> = {
  implemented: { icon: CheckCircle, variant: 'success', label: 'Implemented', iconClass: 'text-green-500' },
  in_progress: { icon: Clock, variant: 'warning', label: 'In Progress', iconClass: 'text-yellow-500' },
  not_started: { icon: Circle, variant: 'outline', label: 'Not Started', iconClass: 'text-slate-400' },
  not_applicable: { icon: MinusCircle, variant: 'secondary', label: 'N/A', iconClass: 'text-slate-400' },
};

const severityVariant: Record<string, 'destructive' | 'warning' | 'default' | 'outline'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'outline',
};

const STATUS_OPTIONS: ControlStatus[] = ['not_started', 'in_progress', 'implemented', 'not_applicable'];

export function ControlList({ controlsByCategory, onUpdate }: ControlListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<string | null>(null);
  const { showToast } = useToast();

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleStatusChange = async (controlId: string, newStatus: ControlStatus) => {
    setUpdating(controlId);
    const result = await updateControlStatus(controlId, newStatus);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Control status updated', 'success');
      onUpdate?.();
    }
    setUpdating(null);
  };

  const categories = Object.keys(controlsByCategory);

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const controls = controlsByCategory[category];
        const isOpen = expanded[category] !== false; // open by default
        const implementedCount = controls.filter((c) => c.status === 'implemented').length;

        return (
          <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm font-semibold text-slate-900">{category}</span>
                <span className="text-xs text-slate-400">({controls.length} controls)</span>
              </div>
              <div className="text-xs text-slate-500">
                <span className="text-green-600 font-medium">{implementedCount}</span> / {controls.length} implemented
              </div>
            </button>

            {isOpen && (
              <div className="divide-y divide-slate-100">
                {controls.map((control) => {
                  const statusInfo = statusConfig[control.status];
                  const Icon = statusInfo.icon;

                  return (
                    <div key={control.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', statusInfo.iconClass)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-400">{control.control_id}</span>
                          <span className="text-sm font-medium text-slate-900">{control.title}</span>
                          <Badge variant={severityVariant[control.severity]}>{control.severity}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{control.description}</p>
                        {control.owner && (
                          <p className="text-xs text-slate-400 mt-0.5">Owner: {control.owner}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <select
                          value={control.status}
                          onChange={(e) => handleStatusChange(control.id, e.target.value as ControlStatus)}
                          disabled={updating === control.id}
                          className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{statusConfig[s].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
