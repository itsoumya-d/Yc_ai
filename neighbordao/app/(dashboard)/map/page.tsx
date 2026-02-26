'use client';

import { useState } from 'react';
import { MapPin, Wrench, Calendar, AlertTriangle, Users, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type PinType = 'member' | 'resource' | 'event' | 'alert';

interface MapPin {
  id: string; type: PinType; label: string; detail: string;
  x: number; y: number; // relative % positions in the map viewport
}

const DEMO_PINS: MapPin[] = [
  { id: 'p1', type: 'member', label: 'Sarah M.', detail: 'Member since Jan 2024', x: 30, y: 40 },
  { id: 'p2', type: 'member', label: 'Mike T.', detail: 'Extension Ladder available', x: 55, y: 25 },
  { id: 'p3', type: 'resource', label: 'Pressure Washer', detail: 'Available · Owner: Mike T.', x: 60, y: 45 },
  { id: 'p4', type: 'event', label: 'Block Party Mtg', detail: 'Sat, Mar 15 · 4:00 PM', x: 45, y: 65 },
  { id: 'p5', type: 'alert', label: 'Water Main Repair', detail: 'Tomorrow 8am–2pm on Elm St', x: 20, y: 55 },
  { id: 'p6', type: 'member', label: 'Lisa R.', detail: 'Event organizer', x: 70, y: 35 },
  { id: 'p7', type: 'member', label: 'David K.', detail: 'Organizer: Mulch Order', x: 80, y: 60 },
  { id: 'p8', type: 'resource', label: 'Parking Space #4', detail: 'Free · Available Mon–Fri', x: 40, y: 78 },
];

const PIN_STYLES: Record<PinType, { bg: string; icon: React.ElementType; color: string; label: string }> = {
  member:   { bg: '#16A34A', icon: Users,         color: '#16A34A', label: 'Members' },
  resource: { bg: '#0369A1', icon: Wrench,        color: '#0369A1', label: 'Resources' },
  event:    { bg: '#7C3AED', icon: Calendar,      color: '#7C3AED', label: 'Events' },
  alert:    { bg: '#DC2626', icon: AlertTriangle, color: '#DC2626', label: 'Alerts' },
};

const FILTER_TYPES: PinType[] = ['member', 'resource', 'event', 'alert'];

export default function MapPage() {
  const [selected, setSelected] = useState<MapPin | null>(null);
  const [filters, setFilters] = useState<Set<PinType>>(new Set(['member', 'resource', 'event', 'alert']));

  function toggleFilter(type: PinType) {
    setFilters(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const visiblePins = DEMO_PINS.filter(p => filters.has(p.type));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Neighborhood Map
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Oak Hills Community — 42 members</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
          {FILTER_TYPES.map(type => {
            const style = PIN_STYLES[type];
            const active = filters.has(type);
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all', active ? 'text-white' : 'border bg-white')}
                style={active ? { background: style.bg } : { borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                <style.icon className="h-3 w-3" />
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden" style={{ background: '#EBF4E8' }}>
        {/* Decorative map background */}
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          {/* Streets */}
          <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#D1FAE5" strokeWidth="20" />
          <line x1="0%" y1="30%" x2="100%" y2="30%" stroke="#D1FAE5" strokeWidth="12" />
          <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#D1FAE5" strokeWidth="20" />
          <line x1="25%" y1="0%" x2="25%" y2="100%" stroke="#D1FAE5" strokeWidth="10" />
          <line x1="75%" y1="0%" x2="75%" y2="100%" stroke="#D1FAE5" strokeWidth="10" />
          {/* Blocks */}
          <rect x="5%" y="5%" width="18%" height="22%" rx="4" fill="#F0FDF4" opacity="0.8" />
          <rect x="28%" y="5%" width="20%" height="22%" rx="4" fill="#F0FDF4" opacity="0.8" />
          <rect x="53%" y="5%" width="20%" height="22%" rx="4" fill="#F0FDF4" opacity="0.8" />
          <rect x="5%" y="33%" width="18%" height="30%" rx="4" fill="#F0FDF4" opacity="0.8" />
          <rect x="28%" y="33%" width="20%" height="30%" rx="4" fill="#F0FDF4" opacity="0.8" />
          <rect x="53%" y="33%" width="20%" height="30%" rx="4" fill="#F0FDF4" opacity="0.8" />
          <rect x="78%" y="33%" width="18%" height="30%" rx="4" fill="#F0FDF4" opacity="0.8" />
          {/* Park */}
          <rect x="28%" y="68%" width="45%" height="28%" rx="8" fill="#BBF7D0" opacity="0.6" />
          <text x="50%" y="82%" textAnchor="middle" fill="#15803D" fontSize="13" fontWeight="600">Oak Hills Park</text>
          {/* Neighborhood boundary */}
          <rect x="3%" y="3%" width="94%" height="94%" rx="12" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeDasharray="10,6" opacity="0.6" />
        </svg>

        {/* Map pins */}
        {visiblePins.map(pin => {
          const style = PIN_STYLES[pin.type];
          const Icon = style.icon;
          const isAlert = pin.type === 'alert';
          return (
            <button
              key={pin.id}
              onClick={() => setSelected(selected?.id === pin.id ? null : pin)}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              aria-label={`${style.label}: ${pin.label}`}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95',
                  isAlert && 'animate-alert-pulse',
                  selected?.id === pin.id && 'ring-4 ring-white scale-110',
                )}
                style={{ background: style.bg }}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="mx-auto -mt-1 h-2 w-2 rotate-45" style={{ background: style.bg }} />
            </button>
          );
        })}

        {/* Selected pin popup */}
        {selected && (
          <div
            className="absolute z-10 min-w-[180px] rounded-xl border bg-white p-3 shadow-lg"
            style={{
              left: `${Math.min(75, selected.x)}%`,
              top: `${Math.max(10, selected.y - 20)}%`,
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: PIN_STYLES[selected.type].bg }}>
                {(() => { const Icon = PIN_STYLES[selected.type].icon; return <Icon className="h-3.5 w-3.5 text-white" />; })()}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selected.detail}</div>
              </div>
            </div>
            <button
              className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-white"
              style={{ background: PIN_STYLES[selected.type].bg }}
            >
              View Details
            </button>
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1">
          {['+', '−'].map(label => (
            <button key={label} className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white text-lg font-bold shadow-md hover:bg-[#F5F5F4]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-xl border bg-white/90 p-3 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Legend</div>
          {FILTER_TYPES.map(type => {
            const style = PIN_STYLES[type];
            const Icon = style.icon;
            return (
              <div key={type} className="flex items-center gap-2 text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: style.bg }}>
                  <Icon className="h-2.5 w-2.5 text-white" />
                </div>
                {style.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
