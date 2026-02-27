'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { exportMeetingsAsICS } from '@/lib/actions/calendar';
import type { CalendarEvent } from '@/lib/actions/calendar';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Video, Download } from 'lucide-react';

interface MiniCalendarProps {
  events: CalendarEvent[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function MiniCalendar({ events }: MiniCalendarProps) {
  const { toast } = useToast();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [exporting, setExporting] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.start);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const isToday = (day: number) => {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleExport = async () => {
    setExporting(true);
    const result = await exportMeetingsAsICS();
    setExporting(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    if (result.data) {
      const blob = new Blob([result.data], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'boardbrief-meetings.ics';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Calendar file downloaded!' });
    }
  };

  // Upcoming events list
  const upcomingEvents = events
    .filter((e) => new Date(e.start) >= today)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <div className="lg:col-span-2">
        <Card className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded hover:bg-[var(--muted)] transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-[var(--muted-foreground)] py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              const dayEvents = getEventsForDay(day);
              const todayCell = isToday(day);

              return (
                <div
                  key={day}
                  className={`min-h-[60px] rounded-lg p-1 text-xs transition-colors ${
                    todayCell
                      ? 'bg-navy-900 text-white'
                      : 'hover:bg-[var(--muted)] text-[var(--foreground)]'
                  }`}
                >
                  <div className={`text-center font-medium mb-1 ${todayCell ? 'text-gold-400' : ''}`}>
                    {day}
                  </div>
                  {dayEvents.slice(0, 2).map((e) => (
                    <Link
                      key={e.id}
                      href={`/meetings/${e.id}`}
                      className={`block truncate rounded px-1 py-0.5 text-[10px] leading-tight mb-0.5 transition-opacity hover:opacity-80 ${
                        todayCell
                          ? 'bg-gold-500/20 text-gold-300'
                          : 'bg-navy-900/10 text-navy-900'
                      }`}
                      title={e.title}
                    >
                      {formatTime(e.start)} {e.title}
                    </Link>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className={`text-[10px] text-center ${todayCell ? 'text-navy-300' : 'text-[var(--muted-foreground)]'}`}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Export */}
          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
            <p className="text-xs text-[var(--muted-foreground)]">
              {events.length} upcoming meeting{events.length !== 1 ? 's' : ''} in the next 60 days
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              {exporting ? 'Exporting...' : 'Export .ics'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Upcoming Events List */}
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Upcoming Meetings</h3>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
              <p className="text-sm text-[var(--muted-foreground)]">No upcoming meetings</p>
              <Link
                href="/meetings/new"
                className="mt-2 text-xs text-navy-700 hover:underline"
              >
                Schedule a meeting →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const eventDate = new Date(event.start);
                const isEventToday = eventDate.toDateString() === today.toDateString();
                const isTomorrow = new Date(today.getTime() + 86400000).toDateString() === eventDate.toDateString();

                return (
                  <Link
                    key={event.id}
                    href={`/meetings/${event.id}`}
                    className="block rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-center rounded-lg p-2 min-w-[44px] ${isEventToday ? 'bg-navy-900 text-white' : 'bg-[var(--muted)]'}`}>
                        <div className={`text-[10px] font-medium uppercase ${isEventToday ? 'text-gold-400' : 'text-[var(--muted-foreground)]'}`}>
                          {MONTHS[eventDate.getMonth()].slice(0, 3)}
                        </div>
                        <div className={`text-lg font-bold leading-none ${isEventToday ? 'text-white' : 'text-[var(--foreground)]'}`}>
                          {eventDate.getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {event.title}
                        </p>
                        <div className="flex flex-wrap gap-x-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <Clock className="w-3 h-3" />
                            {isEventToday ? 'Today' : isTomorrow ? 'Tomorrow' : ''} {formatTime(event.start)}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {event.location}
                            </span>
                          )}
                          {event.link && (
                            <span className="flex items-center gap-1 text-xs text-navy-700">
                              <Video className="w-3 h-3" />
                              Video
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        {/* Add to Calendar options */}
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Subscribe to Calendar</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            Keep your calendar app synced with BoardBrief meetings.
          </p>
          <ol className="text-xs text-[var(--muted-foreground)] space-y-1.5 list-decimal list-inside">
            <li>Export the .ics file above</li>
            <li>
              <strong>Google Calendar:</strong> Other calendars → + → Import
            </li>
            <li>
              <strong>Apple Calendar:</strong> File → Import
            </li>
            <li>
              <strong>Outlook:</strong> Add calendar → Upload from file
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
