import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('user_profiles').select('neighborhood_id').eq('id', user!.id).single();

  const { data: events } = await supabase
    .from('events')
    .select('*, user_profile:user_profiles(full_name)')
    .eq('neighborhood_id', profile?.neighborhood_id ?? '')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(20);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Events</h1>
        <Link href="/events/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          + Create Event
        </Link>
      </div>

      {(!events || events.length === 0) ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-4xl mb-3">📅</p>
          <h3 className="font-semibold text-slate-900 mb-1">No upcoming events</h3>
          <p className="text-slate-600 text-sm">Create the first event for your neighborhood!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex gap-4">
                <div className="text-center bg-indigo-50 rounded-xl p-3 min-w-[60px]">
                  <p className="text-xs font-medium text-indigo-600 uppercase">{new Date(event.starts_at).toLocaleDateString('en-US', { month: 'short' })}</p>
                  <p className="text-2xl font-bold text-indigo-700">{new Date(event.starts_at).getDate()}</p>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{event.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>📍 {event.location}</span>
                    <span>🕐 {new Date(event.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    <span>👥 {event.rsvp_count} going</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
