'use client';

export default function NutritionPlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Nutrition Planner</h1>
        <p className="text-sm text-text-secondary mt-1">Plan and track your pet's diet.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg"><div className="w-5 h-5 text-green-600" /></div>
            <h3 className="font-semibold text-text-primary">Current Diet Plan</h3>
          </div>
          <p className="text-sm text-text-secondary">Premium Dry Food + Wet Food Mix</p>
          <p className="text-xs text-text-tertiary mt-1">Calories: 850/day</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><div className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-text-primary">Feeding Schedule</h3>
          </div>
          <p className="text-sm text-text-secondary">7:00 AM - Breakfast (1 cup dry) | 12:00 PM - Snack | 6:00 PM - Dinner (1/2 cup wet + 1/2 cup dry)</p>
          
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg"><div className="w-5 h-5 text-yellow-600" /></div>
            <h3 className="font-semibold text-text-primary">Dietary Notes</h3>
          </div>
          <p className="text-sm text-text-secondary">Grain-free preferred, chicken protein source. Avoid: corn, soy, artificial colors.</p>
          
        </div>
      </div>
    </div>
  );
}
