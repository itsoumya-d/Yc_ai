'use client';

export default function BookaServicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Book a Service</h1>
        <p className="text-sm text-text-secondary mt-1">Schedule an appointment.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><div className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-text-primary">Select Service</h3>
          </div>
          <p className="text-sm text-text-secondary">Choose from grooming, walking, sitting, training</p>
          
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><div className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-semibold text-text-primary">Pick Date & Time</h3>
          </div>
          <p className="text-sm text-text-secondary">Available slots shown after service selection</p>
          
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg"><div className="w-5 h-5 text-purple-600" /></div>
            <h3 className="font-semibold text-text-primary">Confirm Booking</h3>
          </div>
          <p className="text-sm text-text-secondary">Review details and confirm your appointment</p>
          
        </div>
      </div>
    </div>
  );
}
