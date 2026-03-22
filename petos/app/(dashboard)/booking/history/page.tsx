'use client';

export default function BookingHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Booking History</h1>
        <p className="text-sm text-text-secondary mt-1">Your past and upcoming appointments.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><div className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-text-primary">Grooming - Happy Paws Salon</h3>
          </div>
          <p className="text-sm text-text-secondary">Mar 15, 2026 at 10:00 AM</p>
          <p className="text-xs text-text-tertiary mt-1">Upcoming</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><div className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-semibold text-text-primary">Dog Walking - Sarah M.</h3>
          </div>
          <p className="text-sm text-text-secondary">Mar 5, 2026</p>
          <p className="text-xs text-text-tertiary mt-1">Completed</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><div className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-semibold text-text-primary">Vet Checkup - Dr. Chen</h3>
          </div>
          <p className="text-sm text-text-secondary">Feb 20, 2026</p>
          <p className="text-xs text-text-tertiary mt-1">Completed</p>
        </div>
      </div>
    </div>
  );
}
