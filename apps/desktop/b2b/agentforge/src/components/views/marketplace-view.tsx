import { cn } from '@/lib/utils';
import {
  Store,
  Search,
  Star,
  Download,
  Eye,
  ShoppingCart,
  Workflow,
  Wrench,
  FileText,
  Database,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { useState } from 'react';

interface MarketplaceItem {
  id: string;
  name: string;
  type: 'template' | 'tool' | 'prompt' | 'dataset';
  author: string;
  installs: number;
  rating: number;
  price: number;
  description: string;
  featured: boolean;
}

const tabs = ['Featured', 'Templates', 'Tools', 'Prompts', 'Datasets', 'My Uploads'];

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  template: Workflow,
  tool: Wrench,
  prompt: FileText,
  dataset: Database,
};

const demoItems: MarketplaceItem[] = [
  { id: 'm1', name: 'Stripe Integration', type: 'tool', author: '@devtools_inc', installs: 1234, rating: 4.8, price: 0, description: 'Full Stripe API integration with payment processing, invoice lookup, and customer management.', featured: true },
  { id: 'm2', name: 'Slack Notifier', type: 'tool', author: '@agent_builder', installs: 892, rating: 4.6, price: 9.99, description: 'Send messages, create channels, and manage Slack workspace via agent actions.', featured: true },
  { id: 'm3', name: 'Legal Document Reviewer', type: 'template', author: '@legalai', installs: 567, rating: 4.4, price: 29.99, description: 'Review contracts and legal documents for risks, compliance issues, and key terms.', featured: true },
  { id: 'm4', name: 'E-commerce Support Bundle', type: 'template', author: '@shopassist', installs: 2103, rating: 4.9, price: 0, description: 'Complete customer support agent with order tracking, refunds, and product recommendations.', featured: false },
  { id: 'm5', name: 'SEO Content Generator', type: 'prompt', author: '@contentpro', installs: 445, rating: 4.3, price: 4.99, description: 'Optimized prompts for generating SEO-friendly blog posts, meta descriptions, and titles.', featured: false },
  { id: 'm6', name: 'Customer Feedback Dataset', type: 'dataset', author: '@dataforge', installs: 312, rating: 4.1, price: 0, description: '10,000 labeled customer feedback examples for training and evaluating support agents.', featured: false },
  { id: 'm7', name: 'GitHub PR Analyzer', type: 'tool', author: '@devtools_inc', installs: 789, rating: 4.7, price: 0, description: 'Analyze pull requests, review code changes, and provide automated feedback.', featured: false },
  { id: 'm8', name: 'Multi-Turn Conversation', type: 'prompt', author: '@promptcraft', installs: 234, rating: 4.5, price: 0, description: 'Advanced system prompts for maintaining context in multi-turn conversations.', featured: false },
];

export function MarketplaceView() {
  const [activeTab, setActiveTab] = useState('Featured');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = demoItems.filter((item) => {
    const matchesTab = activeTab === 'Featured'
      ? item.featured
      : activeTab === 'My Uploads'
        ? false
        : item.type === activeTab.toLowerCase().slice(0, -1);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && (activeTab === 'Featured' ? item.featured : matchesTab);
  });

  // If showing Featured tab, also show "Trending" items
  const trendingItems = activeTab === 'Featured' ? demoItems.filter((i) => !i.featured).slice(0, 4) : [];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Marketplace</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border-default px-4 py-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs transition-colors',
              activeTab === tab
                ? 'bg-bg-surface-hover text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Featured / Filtered Items */}
        <div>
          {activeTab === 'Featured' && (
            <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Featured This Week</h3>
          )}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {filtered.map((item) => {
              const Icon = typeIcons[item.type] ?? Workflow;
              return (
                <div key={item.id} className="rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-border-emphasis hover:shadow-2">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-text-primary">{item.name}</h4>
                        <div className="text-[10px] capitalize text-text-tertiary">{item.type}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-2 text-[11px] text-text-secondary">{item.author}</div>
                  <p className="mb-3 line-clamp-2 text-xs text-text-secondary">{item.description}</p>

                  <div className="mb-3 flex items-center gap-3 text-[11px] text-text-tertiary">
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{item.installs.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={cn('text-xs font-medium', item.price === 0 ? 'text-success' : 'text-text-primary')}>
                      {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="rounded-md border border-border-default px-2.5 py-1 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                        <Eye className="h-3 w-3" />
                      </button>
                      <button className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-active">
                        {item.price === 0 ? 'Install' : 'Purchase'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending Section (only on Featured tab) */}
        {trendingItems.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Trending</h3>
              <button className="text-xs text-text-link hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {trendingItems.map((item) => {
                const Icon = typeIcons[item.type] ?? Workflow;
                return (
                  <div key={item.id} className="rounded-lg border border-border-default bg-bg-surface p-3 transition-all hover:border-border-emphasis">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-text-secondary" />
                      <span className="text-xs font-medium text-text-primary">{item.name}</span>
                    </div>
                    <div className="mb-2 text-[10px] text-text-tertiary">{item.author}</div>
                    <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
                      <span>{item.installs.toLocaleString()} installs</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-warning text-warning" />
                        <span>{item.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
