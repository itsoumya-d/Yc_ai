'use client';

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Community</h1>
        <p className="text-sm text-text-secondary mt-1">Connect with other pet owners.</p>
      </div>
      <div className="space-y-4">
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg"><div className="w-5 h-5 text-orange-600" /></div>
            <h3 className="font-semibold text-text-primary">Popular: Best food for senior dogs?</h3>
          </div>
          <p className="text-sm text-text-secondary">32 replies · 156 views · 2h ago</p>
          <p className="text-xs text-text-tertiary mt-1">Category: Nutrition</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><div className="w-5 h-5 text-blue-600" /></div>
            <h3 className="font-semibold text-text-primary">My puppy won't stop barking at night</h3>
          </div>
          <p className="text-sm text-text-secondary">18 replies · 89 views · 5h ago</p>
          <p className="text-xs text-text-tertiary mt-1">Category: Training</p>
        </div>
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-50 rounded-lg"><div className="w-5 h-5 text-pink-600" /></div>
            <h3 className="font-semibold text-text-primary">Share: My cat's recovery journey</h3>
          </div>
          <p className="text-sm text-text-secondary">45 replies · 234 views · 1d ago</p>
          <p className="text-xs text-text-tertiary mt-1">Category: Stories</p>
        </div>
      </div>
    </div>
  );
}
