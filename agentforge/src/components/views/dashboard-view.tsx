import { useState, useMemo, useCallback } from 'react';
import { cn, getAgentStatusBadge, getNodeColor, getNodeLabel, generateAgentName } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { generateId, saveAgent, deleteAgent as deleteAgentStorage, formatRelativeDate } from '@/lib/storage';
import type { Agent, AgentNodeType } from '@/types/database';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Workflow,
  Upload,
  Store,
  Clock,
  MoreHorizontal,
  Copy,
  Trash2,
  FileOutput,
  Bot,
} from 'lucide-react';

export function DashboardView() {
  const { setCurrentView, setCurrentAgent, agents, addAgent, removeAgent } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredAgents = useMemo(() =>
    agents.filter(
      (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [agents, searchQuery],
  );

  const handleNewAgent = useCallback(() => {
    const newAgent: Agent = {
      id: generateId(),
      team_id: 'default',
      name: generateAgentName(),
      description: '',
      status: 'draft',
      version: 'v0.1',
      node_count: 0,
      created_by: 'you',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      tags: [],
    };
    addAgent(newAgent);
    saveAgent(newAgent);
    setCurrentAgent(newAgent.id, newAgent.name);
    setCurrentView('editor');
  }, [addAgent, setCurrentAgent, setCurrentView]);

  const handleOpenAgent = useCallback((agent: Agent) => {
    setCurrentAgent(agent.id, agent.name);
    setCurrentView('editor');
  }, [setCurrentAgent, setCurrentView]);

  const handleDuplicateAgent = useCallback((agent: Agent) => {
    const dup: Agent = {
      ...agent,
      id: generateId(),
      name: `${agent.name} (copy)`,
      status: 'draft',
      version: 'v0.1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addAgent(dup);
    saveAgent(dup);
  }, [addAgent]);

  const handleDeleteAgent = useCallback((id: string) => {
    removeAgent(id);
    deleteAgentStorage(id);
  }, [removeAgent]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-64 rounded-md border border-border-default bg-bg-surface-raised pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center rounded-md border border-border-default">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('rounded-l-md p-1.5', viewMode === 'grid' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary hover:text-text-secondary')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('rounded-r-md p-1.5', viewMode === 'list' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-tertiary hover:text-text-secondary')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <button onClick={handleNewAgent} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-active">
          <Plus className="h-3.5 w-3.5" />
          New Agent
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface-raised">
              <Bot className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-medium text-text-primary">No agents yet</h2>
            <p className="mt-2 max-w-sm text-sm text-text-secondary">
              Create your first AI agent or start from a template.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={handleNewAgent} className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-text-on-color hover:bg-primary-active">
                <Plus className="h-3.5 w-3.5" /> New Agent
              </button>
              <button onClick={() => setCurrentView('templates')} className="flex items-center gap-1.5 rounded-md border border-border-default px-4 py-2 text-xs text-text-secondary hover:bg-bg-surface-raised">
                <Workflow className="h-3.5 w-3.5" /> From Template
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Recent Agents Section */}
            <div className="mb-4">
              <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
                Recent Agents ({filteredAgents.length})
              </h3>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-3 2xl:grid-cols-4">
                  {filteredAgents.map((agent) => {
                    const badge = getAgentStatusBadge(agent.status);
                    return (
                      <div
                        key={agent.id}
                        onClick={() => handleOpenAgent(agent)}
                        className="group cursor-pointer rounded-lg border border-border-default bg-bg-surface p-4 transition-all hover:border-border-emphasis hover:shadow-2"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="text-sm font-medium text-text-primary">{agent.name}</h4>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4 text-text-tertiary hover:text-text-secondary" />
                          </button>
                        </div>
                        <p className="mb-3 line-clamp-2 text-xs text-text-secondary">
                          {agent.description || 'No description'}
                        </p>

                        {/* Tags */}
                        {agent.tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {agent.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-bg-surface-raised px-1.5 py-0.5 text-[10px] text-text-tertiary">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-text-tertiary">
                          <div className="flex items-center gap-3">
                            <span>{agent.node_count} nodes</span>
                            <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px]', badge.color)}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeDate(agent.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-border-default bg-bg-surface">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border-subtle">
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Name</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Status</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Nodes</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Version</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Updated</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAgents.map((agent) => {
                        const badge = getAgentStatusBadge(agent.status);
                        return (
                          <tr
                            key={agent.id}
                            onClick={() => handleOpenAgent(agent)}
                            className="cursor-pointer border-b border-border-subtle transition-colors hover:bg-bg-surface-hover"
                          >
                            <td className="px-3 py-2">
                              <div className="text-xs font-medium text-text-primary">{agent.name}</div>
                              <div className="text-[11px] text-text-tertiary">{agent.description || 'No description'}</div>
                            </td>
                            <td className="px-3 py-2">
                              <span className={cn('rounded-full border px-2 py-0.5 text-[10px]', badge.color)}>
                                {badge.label}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-mono text-xs text-text-secondary">{agent.node_count}</td>
                            <td className="px-3 py-2 font-mono text-xs text-text-secondary">{agent.version}</td>
                            <td className="px-3 py-2 text-xs text-text-tertiary">{formatRelativeDate(agent.updated_at)}</td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={(e) => { e.stopPropagation(); handleDuplicateAgent(agent); }} className="rounded p-1 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary">
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button onClick={(e) => e.stopPropagation()} className="rounded p-1 text-text-tertiary hover:bg-bg-surface-hover hover:text-text-secondary">
                                  <FileOutput className="h-3 w-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAgent(agent.id); }} className="rounded p-1 text-text-tertiary hover:bg-error/10 hover:text-error">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-tertiary">Quick Actions</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('templates')}
                  className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-3 text-xs text-text-secondary transition-colors hover:border-border-emphasis hover:text-text-primary"
                >
                  <Workflow className="h-4 w-4 text-primary" />
                  Start from Template
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-3 text-xs text-text-secondary transition-colors hover:border-border-emphasis hover:text-text-primary">
                  <Upload className="h-4 w-4 text-node-tool" />
                  Import Agent
                </button>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface px-4 py-3 text-xs text-text-secondary transition-colors hover:border-border-emphasis hover:text-text-primary"
                >
                  <Store className="h-4 w-4 text-node-llm" />
                  View Marketplace
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
