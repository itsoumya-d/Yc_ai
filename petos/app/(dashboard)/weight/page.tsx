'use client';

export default function WeightTrackerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Weight Tracker</h1>
        <p className="text-sm text-text-secondary mt-1">Monitor your pet's weight over time.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><div className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-semibold text-text-primary">Current Weight</h3>
          </div>
          <p className="text-sm text-text-secondary">24.5 lbs</p>
          <p className="text-xs text-text-tertiary mt-1">Ideal: 22-26 lbs</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><div className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-text-primary">Weight Goal</h3>
          </div>
          <p className="text-sm text-text-secondary">25 lbs</p>
          <p className="text-xs text-text-tertiary mt-1">On track - within healthy range</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg"><div className="w-5 h-5 text-purple-600" /></div>
            <h3 className="font-semibold text-text-primary">Last Weighed</h3>
          </div>
          <p className="text-sm text-text-secondary">Mar 5, 2026</p>
          <p className="text-xs text-text-tertiary mt-1">Change: -0.3 lbs from last month</p>
        </div>
      </div>
    </div>
  );
}
