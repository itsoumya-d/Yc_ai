'use client';

import { useState } from 'react';
import { Plus, MapPin, Calendar, Users, Check, X, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { Event, EventRsvp } from '@/types/database';

interface EventWithRsvp extends Event {
  userRsvp: EventRsvp | null;
  contributions_checklist?: Array<{ item: string; claimed_by: string | null }>;
}

const DEMO_EVENTS: EventWithRsvp[] = [
  {
    id: 'e1', neighborhood_id: 'n1', organizer_id: 'u1',
    title: 'Block Party Planning Meeting',
    description: 'Final planning meeting for the annual block party. We need to finalize food vendors, games, and setup schedule. All hands on deck!',
    location: 'Community Center, Room 2B',
    start_time: new Date(Date.now() + 2 * 86_400_000 + 16 * 3600_000).toISOString(),
    end_time: new Date(Date.now() + 2 * 86_400_000 + 18 * 3600_000).toISOString(),
    max_attendees: 30, rsvp_count: 12, maybe_count: 5,
    contributions_needed: ['Bring ideas for activities', 'Volunteer for setup'],
    created_at: '', userRsvp: 'going',
    contributions_checklist: [
      { item: 'Bring compost (2 bags)', claimed_by: null },
      { item: 'Bring garden tools', claimed_by: null },
      { item: 'Bring snacks', claimed_by: 'Sarah M.' },
    ],
    organizer: { id: 'u1', full_name: 'Lisa R.', display_name: 'Lisa R.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
  {
    id: 'e2', neighborhood_id: 'n1', organizer_id: 'u2',
    title: 'Community Garden Spring Prep',
    description: 'Annual spring preparation for the community garden. We\'ll clear last year\'s beds, add compost, and plan the new season. All skill levels welcome!',
    location: 'Garden Plots — Lot B',
    start_time: new Date(Date.now() + 9 * 86_400_000 + 9 * 3600_000).toISOString(),
    end_time: new Date(Date.now() + 9 * 86_400_000 + 13 * 3600_000).toISOString(),
    max_attendees: 20, rsvp_count: 8, maybe_count: 3,
    contributions_needed: ['Compost bags', 'Garden tools', 'Snacks'],
    created_at: '', userRsvp: null,
    contributions_checklist: [
      { item: 'Bring compost (2 more needed)', claimed_by: null },
      { item: 'Bring garden tools', claimed_by: null },
      { item: 'Bring snacks', claimed_by: 'Sarah M.' },
    ],
    organizer: { id: 'u2', full_name: 'Ann P.', display_name: 'Ann P.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
  {
    id: 'e3', neighborhood_id: 'n1', organizer_id: 'u3',
    title: 'Outdoor Movie Night — Jurassic Park',
    description: 'Bring blankets, chairs, and snacks! We\'ll be setting up the community projector at the park. Classic 90s vibes.',
    location: 'Oak Hills Park — Main Lawn',
    start_time: new Date(Date.now() + 14 * 86_400_000 + 20 * 3600_000).toISOString(),
    end_time: null,
    max_attendees: null, rsvp_count: 22, maybe_count: 9,
    contributions_needed: ['BYO snacks', 'BYO chairs/blankets'],
    created_at: '', userRsvp: 'maybe',
    organizer: { id: 'u3', full_name: 'Mike T.', display_name: 'Mike T.', bio: null, avatar_url: null, skills: [], phone: null, address: null, address_verified: false, show_on_map: false, show_in_directory: true, allow_dm: true, created_at: '', updated_at: '' },
  },
];

const RSVP_OPTIONS: Array<{ value: EventRsvp; label: string; icon: React.ElementType; activeClass: string }> = [
  { value: 'going',     label: 'Going',        icon: Check,  activeClass: 'bg-[#7C3AED] text-white border-[#7C3AED]' },
  { value: 'maybe',     label: 'Maybe',        icon: Clock,  activeClass: 'bg-[#FEF9C3] text-[#A16207] border-[#CA8A04]' },
  { value: 'not_going', label: "Can't make it", icon: X,    activeClass: 'bg-[#F5F5F4] text-[#78716C] border-[#D6D3D1]' },
];

function EventCard({ event }: { event: EventWithRsvp }) {
  const [rsvp, setRsvp] = useState<EventRsvp | null>(event.userRsvp);
  const startDate = new Date(event.start_time);
  const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / 86_400_000);
  const spotsLeft = event.max_attendees ? event.max_attendees - event.rsvp_count : null;

  return (
    <div className="rounded-2xl border border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md" style={{ borderColor: 'var(--border)', borderLeftColor: '#7C3AED' }}>
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div className="shrink-0 rounded-xl bg-[#F5F3FF] p-2 text-center min-w-[52px]">
          <div className="text-xs font-semibold uppercase text-[#7C3AED]">
            {startDate.toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-xl font-extrabold leading-tight text-[#7C3AED]" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
            {startDate.getDate()}
          </div>
          <div className="text-[10px] text-[#7C3AED]">
            {startDate.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            {event.title}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {event.rsvp_count} attending{spotsLeft !== null ? `, ${spotsLeft} spots left` : ''}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {event.description}
          </p>

          {/* Contributions checklist */}
          {event.contributions_checklist && event.contributions_checklist.length > 0 && (
            <div className="mt-3 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
                Contributions needed
              </div>
              {event.contributions_checklist.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className={cn('h-4 w-4 rounded-sm border flex items-center justify-center', c.claimed_by ? 'bg-[#16A34A] border-[#16A34A]' : 'border-[var(--border)]')}>
                    {c.claimed_by && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span style={{ color: c.claimed_by ? 'var(--text-tertiary)' : 'var(--text-secondary)', textDecoration: c.claimed_by ? 'line-through' : 'none' }}>
                    {c.item}
                  </span>
                  {c.claimed_by && <span className="text-xs text-[#16A34A]">— {c.claimed_by}</span>}
                </div>
              ))}
            </div>
          )}

          {/* RSVP buttons */}
          <div className="mt-3 flex gap-2">
            {RSVP_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRsvp(rsvp === opt.value ? null : opt.value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.97]',
                  rsvp === opt.value ? opt.activeClass : 'hover:bg-[var(--bg-subtle)]',
                )}
                style={rsvp !== opt.value ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : undefined}
              >
                <opt.icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = DEMO_EVENTS.filter(e => new Date(e.start_time) > new Date());
  const past: EventWithRsvp[] = [];

  // Group upcoming by week
  const thisWeek = upcoming.filter(e => {
    const days = (new Date(e.start_time).getTime() - Date.now()) / 86_400_000;
    return days <= 7;
  });
  const later = upcoming.filter(e => {
    const days = (new Date(e.start_time).getTime() - Date.now()) / 86_400_000;
    return days > 7;
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Events
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: 'var(--text-secondary)' }}>Upcoming neighborhood activities</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#6D28D9] active:scale-[0.97]">
          <Plus className="h-4 w-4" /> Create Event
        </button>
      </div>

      <div className="mb-5 flex border-b" style={{ borderColor: 'var(--border)' }}>
        {[['upcoming', 'Upcoming'], ['past', 'Past']] .map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as 'upcoming' | 'past')}
            className={cn('px-4 py-2.5 text-sm font-medium', tab === key ? 'border-b-2 border-[#7C3AED] text-[#7C3AED]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'upcoming' && (
        <div className="space-y-6">
          {thisWeek.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>This Week</h2>
              <div className="space-y-4">{thisWeek.map(e => <EventCard key={e.id} event={e} />)}</div>
            </div>
          )}
          {later.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>Coming Up</h2>
              <div className="space-y-4">{later.map(e => <EventCard key={e.id} event={e} />)}</div>
            </div>
          )}
        </div>
      )}

      {tab === 'past' && (
        <div className="rounded-2xl border bg-white py-16 text-center" style={{ borderColor: 'var(--border)' }}>
          <Calendar className="mx-auto mb-3 h-10 w-10 text-[var(--text-tertiary)]" />
          <p className="text-base" style={{ color: 'var(--text-secondary)' }}>No past events yet.</p>
        </div>
      )}
    </div>
  );
}
