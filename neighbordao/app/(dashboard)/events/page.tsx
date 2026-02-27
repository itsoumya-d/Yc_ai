import { Calendar, Plus, MapPin, Users, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tabs = ['Upcoming', 'Past', 'My Events'];

export default function EventsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Events
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Neighborhood gatherings, meetups, and activities
          </p>
        </div>
        <Button size="md">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              i === 0
                ? 'border-leaf-600 text-leaf-700'
                : 'border-transparent text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <Card padding="lg" className="text-center">
        <Calendar className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <h3 className="font-heading text-lg font-bold text-text-primary">
          No upcoming events
        </h3>
        <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
          Organize block parties, garden cleanups, neighborhood meetups, and more. Track RSVPs
          and coordinate contributions from attendees.
        </p>
        <Button className="mt-4">
          <Plus className="h-4 w-4" />
          Create First Event
        </Button>
      </Card>
    </div>
  );
}
