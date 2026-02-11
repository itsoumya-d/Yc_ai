import { cn, getNodeColor, getNodeLabel } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { AgentNodeType } from '@/types/database';
import {
  LayoutGrid,
  Search,
  Eye,
  ArrowRight,
  Workflow,
  Brain,
  Database,
  Shield,
  Wrench,
  MessageSquare,
  BarChart3,
  Code,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

interface DemoTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeCount: number;
  tools: string[];
  memoryType: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  nodeTypes: AgentNodeType[];
}

const categories = ['All', 'Customer Support', 'Research', 'Data', 'Code', 'Content', 'Sales', 'Internal Tools'];

const demoTemplates: DemoTemplate[] = [
  {
    id: 't1', name: 'Customer Support Bot', description: 'Handle customer inquiries with tool lookups, order tracking, and escalation logic.',
    category: 'Customer Support', nodeCount: 12, tools: ['DB Query', 'Web Search'], memoryType: 'Buffer',
    difficulty: 'intermediate', nodeTypes: ['input', 'llm', 'tool', 'condition', 'output'],
  },
  {
    id: 't2', name: 'Research Assistant', description: 'Search, analyze, and summarize information from multiple sources with proper citations.',
    category: 'Research', nodeCount: 8, tools: ['Web Search', 'File Read'], memoryType: 'RAG',
    difficulty: 'intermediate', nodeTypes: ['input', 'llm', 'memory', 'tool', 'output'],
  },
  {
    id: 't3', name: 'Data Analyst', description: 'Query databases, analyze data trends, and generate automated reports with visualizations.',
    category: 'Data', nodeCount: 15, tools: ['DB Query', 'Code Execute'], memoryType: null,
    difficulty: 'advanced', nodeTypes: ['input', 'tool', 'llm', 'transform', 'output'],
  },
  {
    id: 't4', name: 'Code Reviewer', description: 'Review pull requests, suggest improvements, check for bugs and security issues.',
    category: 'Code', nodeCount: 10, tools: ['File Read', 'Code Execute'], memoryType: null,
    difficulty: 'advanced', nodeTypes: ['input', 'llm', 'tool', 'guardrail', 'output'],
  },
  {
    id: 't5', name: 'Content Writer', description: 'Generate blog posts, social media content, and marketing copy with brand voice consistency.',
    category: 'Content', nodeCount: 7, tools: ['Web Search'], memoryType: 'Buffer',
    difficulty: 'beginner', nodeTypes: ['input', 'llm', 'memory', 'output'],
  },
  {
    id: 't6', name: 'Sales Email Drafter', description: 'Draft personalized outreach emails based on CRM data and prospect research.',
    category: 'Sales', nodeCount: 9, tools: ['HTTP Request', 'Web Search'], memoryType: null,
    difficulty: 'intermediate', nodeTypes: ['input', 'tool', 'llm', 'output'],
  },
  {
    id: 't7', name: 'Meeting Summarizer', description: 'Analyze meeting transcripts, extract action items, and send summaries to attendees.',
    category: 'Internal Tools', nodeCount: 6, tools: ['File Read'], memoryType: null,
    difficulty: 'beginner', nodeTypes: ['input', 'llm', 'output'],
  },
  {
    id: 't8', name: 'Blank Agent', description: 'Start from scratch with an empty canvas. Build your agent node by node.',
    category: 'All', nodeCount: 0, tools: [], memoryType: null,
    difficulty: 'beginner', nodeTypes: [],
  },
];

const difficultyColors: Record<string, string> = {
  beginner: 'bg-success/10 text-success border-success/30',
  intermediate: 'bg-warning/10 text-warning border-warning/30',
  advanced: 'bg-error/10 text-error border-error/30',
};

export function TemplatesView() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = demoTemplates.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Template Gallery</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-56 rounded-md border border-border-default bg-bg-surface-raised pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 border-b border-border-default px-4 py-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'rounded-full px-3 py-1 text-xs transition-colors',
              selectedCategory === cat
                ? 'bg-primary text-text-on-color'
                : 'text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
          {filtered.map((template) => (
            <div key={template.id} className="rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-border-emphasis hover:shadow-2">
              <div className="mb-2 flex items-start justify-between">
                <h4 className="text-sm font-medium text-text-primary">{template.name}</h4>
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] capitalize', difficultyColors[template.difficulty] ?? '')}>
                  {template.difficulty}
                </span>
              </div>
              <p className="mb-3 text-xs text-text-secondary">{template.description}</p>

              {/* Node type badges */}
              {template.nodeTypes.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {[...new Set(template.nodeTypes)].map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]"
                      style={{ backgroundColor: `${getNodeColor(type)}12`, color: getNodeColor(type) }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getNodeColor(type) }} />
                      {getNodeLabel(type)}
                    </span>
                  ))}
                </div>
              )}

              <div className="mb-3 space-y-1 text-[11px] text-text-tertiary">
                {template.nodeCount > 0 && <div>Nodes: {template.nodeCount}</div>}
                {template.tools.length > 0 && <div>Tools: {template.tools.join(', ')}</div>}
                {template.memoryType && <div>Memory: {template.memoryType}</div>}
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                  <Eye className="h-3 w-3" />
                  Preview
                </button>
                <button className="flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-active">
                  <ArrowRight className="h-3 w-3" />
                  Use This
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
