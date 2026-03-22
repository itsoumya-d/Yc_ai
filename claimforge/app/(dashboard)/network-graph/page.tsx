'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Filter, ZoomIn, ZoomOut, Maximize2, Download, X, RefreshCw, AlertTriangle, TrendingUp, Network, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ForceGraph, type GraphNode, type GraphEdge } from '@/components/ForceGraph';
import type { FraudNode, FraudEdge, FraudGraphStats } from '@/app/api/fraud/analyze/route';

// ── Helpers ────────────────────────────────────────────────────────────────
function riskColor(score: number) {
  if (score >= 70) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: '#EF4444' };
  if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: '#F59E0B' };
  return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', dot: '#10B981' };
}

function entityTypeIcon(type: string) {
  const icons: Record<string, string> = {
    person: '👤', organization: '🏢', payment: '💳',
    contract: '📄', address: '📍', claim: '⚖️',
  };
  return icons[type] ?? '🔷';
}

function statCard(icon: React.ReactNode, value: string | number, label: string, accent: string) {
  return (
    <div className={`bg-bg-surface border ${accent} rounded-xl p-4 flex items-center gap-3`}>
      <div className={`p-2 rounded-lg ${accent.replace('border-', 'bg-').replace('-300', '-100').replace('-800', '-100')}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        <div className="text-xs text-text-secondary">{label}</div>
      </div>
    </div>
  );
}

// ── Convert FraudNode → GraphNode (ForceGraph format) ─────────────────────
function toGraphNode(n: FraudNode): GraphNode {
  const typeMap: Record<string, 'claim' | 'person' | 'entity'> = {
    person: 'person',
    organization: 'entity',
    payment: 'claim',
    contract: 'claim',
    address: 'entity',
    claim: 'claim',
  };
  return {
    id: n.id,
    label: n.label.length > 14 ? n.label.slice(0, 13) + '…' : n.label,
    type: typeMap[n.type] ?? 'entity',
    riskScore: n.riskScore,
    x: n.x,
    y: n.y,
    vx: 0,
    vy: 0,
  };
}

function toGraphEdge(e: FraudEdge): GraphEdge {
  return {
    source: e.source,
    target: e.target,
    label: e.label,
  };
}

// ── Component ──────────────────────────────────────────────────────────────
export default function NetworkGraphPage() {
  const [nodes, setNodes] = useState<FraudNode[]>([]);
  const [edges, setEdges] = useState<FraudEdge[]>([]);
  const [stats, setStats] = useState<FraudGraphStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<FraudNode | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [graphSize, setGraphSize] = useState({ w: 700, h: 500 });

  // ── Fetch graph data ───────────────────────────────────────────────────
  const fetchGraph = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/fraud/analyze');
      if (!res.ok) throw new Error('Failed to load graph data');
      const data = await res.json();
      setNodes(data.nodes ?? []);
      setEdges(data.edges ?? []);
      setStats(data.stats ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  // ── Responsive size ────────────────────────────────────────────────────
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setGraphSize({
          w: Math.max(400, rect.width),
          h: isFullscreen ? window.innerHeight - 120 : 500,
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);

  // ── Filtered node list ────────────────────────────────────────────────
  const filteredNodes = nodes.filter(n => {
    if (filter === 'high' && n.riskScore < 70) return false;
    if (filter === 'medium' && (n.riskScore < 40 || n.riskScore >= 70)) return false;
    if (filter === 'low' && n.riskScore >= 40) return false;
    if (showSuspiciousOnly && n.suspiciousConnections === 0) return false;
    if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // ── Graph nodes/edges for render ──────────────────────────────────────
  const visibleIds = new Set(filteredNodes.map(n => n.id));
  const graphNodes = nodes.map(toGraphNode);
  const graphEdges = (showSuspiciousOnly
    ? edges.filter(e => e.isSuspicious)
    : edges
  ).filter(e => {
    if (showSuspiciousOnly) return visibleIds.has(e.source) || visibleIds.has(e.target);
    return true;
  }).map(toGraphEdge);

  // ── Selected node connections ─────────────────────────────────────────
  const getConnections = (nodeId: string) =>
    edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .map(e => {
        const otherId = e.source === nodeId ? e.target : e.source;
        const other = nodes.find(n => n.id === otherId);
        return { ...e, otherId, otherLabel: other?.label ?? otherId, otherType: other?.type ?? 'entity' };
      });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fraud Network Analysis</h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-powered entity relationship graph with real-time fraud scoring
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchGraph}
            className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border-default rounded-lg hover:bg-bg-surface-hover transition-colors text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Re-analyze
          </button>
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className="p-2 bg-bg-surface border border-border-default rounded-lg hover:bg-bg-surface-hover transition-colors"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCard(<AlertTriangle className="h-4 w-4 text-red-600" />, stats.highRiskCount, 'High Risk Entities', 'border-red-200')}
          {statCard(<Network className="h-4 w-4 text-amber-600" />, stats.suspiciousEdges, 'Suspicious Connections', 'border-amber-200')}
          {statCard(<TrendingUp className="h-4 w-4 text-blue-600" />, `${stats.avgRiskScore}`, 'Avg Fraud Score', 'border-blue-200')}
          {statCard(<Shield className="h-4 w-4 text-green-600" />, stats.totalNodes, 'Entities Analyzed', 'border-green-200')}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entities..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-default bg-bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-text-tertiary" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as typeof filter)}
            className="text-sm rounded-lg border border-border-default bg-bg-surface px-3 py-2"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk (70%+)</option>
            <option value="medium">Medium Risk (40–69%)</option>
            <option value="low">Low Risk (&lt;40%)</option>
          </select>
        </div>
        <button
          onClick={() => setShowSuspiciousOnly(s => !s)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            showSuspiciousOnly
              ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/30'
              : 'bg-bg-surface border-border-default text-text-secondary hover:bg-bg-surface-hover'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Suspicious only
        </button>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-xs text-text-secondary ml-auto">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-200 border-2 border-red-400" />Claims</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-200 border-2 border-blue-400" />People</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-200 border-2 border-green-400" />Entities</span>
        </div>
      </div>

      {/* Loading / error state */}
      {loading && (
        <div className="flex items-center justify-center h-64 bg-bg-surface border border-border-default rounded-xl">
          <div className="text-center space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-text-secondary">Running fraud analysis...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm dark:bg-red-950/20 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Graph + Inspector */}
      {!loading && !error && (
        <div className="flex gap-6">
          <div ref={containerRef} className="flex-1 min-w-0">
            <ForceGraph
              nodes={graphNodes}
              edges={graphEdges}
              selectedNodeId={selected?.id ?? null}
              onNodeSelect={node => {
                if (!node) { setSelected(null); return; }
                const full = nodes.find(n => n.id === node.id) ?? null;
                setSelected(full);
              }}
              width={graphSize.w - (selected ? 320 : 0)}
              height={graphSize.h}
            />
            <p className="text-xs text-text-tertiary mt-2 text-center">
              Drag nodes to rearrange · Scroll to zoom · Click to inspect · Node badge = fraud score
            </p>
          </div>

          {/* Inspector drawer */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 300 }}
                exit={{ opacity: 0, x: 20, width: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="shrink-0 overflow-hidden"
              >
                <div className="w-[300px] space-y-3">
                  {/* Entity card */}
                  <div className="bg-bg-surface border border-primary/30 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{entityTypeIcon(selected.type)}</span>
                        <div>
                          <h3 className="font-bold text-text-primary text-sm leading-tight">{selected.label}</h3>
                          <p className="text-xs text-text-tertiary capitalize">{selected.entityType.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-bg-surface-hover">
                        <X className="h-4 w-4 text-text-tertiary" />
                      </button>
                    </div>

                    {/* Risk score meter */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-secondary">Fraud Score</span>
                        <span className={`text-sm font-bold ${riskColor(selected.riskScore).text}`}>
                          {selected.riskScore}/100
                        </span>
                      </div>
                      <div className="h-2 bg-border-default rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${selected.riskScore}%`,
                            backgroundColor: riskColor(selected.riskScore).dot,
                          }}
                        />
                      </div>
                    </div>

                    {/* Risk factors */}
                    {selected.riskFactors.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">Risk Factors</p>
                        <div className="space-y-1">
                          {selected.riskFactors.map((f, i) => (
                            <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md ${riskColor(selected.riskScore).bg} ${riskColor(selected.riskScore).text}`}>
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-bg-surface-hover rounded-lg p-2 text-center">
                        <div className="font-bold text-text-primary">{selected.connectionCount}</div>
                        <div className="text-text-tertiary">Connections</div>
                      </div>
                      <div className="bg-bg-surface-hover rounded-lg p-2 text-center">
                        <div className="font-bold text-red-600">{selected.suspiciousConnections}</div>
                        <div className="text-text-tertiary">Suspicious</div>
                      </div>
                      {selected.totalAmount && (
                        <div className="col-span-2 bg-bg-surface-hover rounded-lg p-2 text-center">
                          <div className="font-bold text-text-primary">${selected.totalAmount.toLocaleString()}</div>
                          <div className="text-text-tertiary">Total Transactions</div>
                        </div>
                      )}
                    </div>

                    {/* Entity resolution badge */}
                    {selected.isResolved && (
                      <div className="mb-3 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-1.5 dark:bg-amber-950/30">
                        <AlertTriangle className="h-3 w-3" />
                        Resolved alias entity
                      </div>
                    )}
                  </div>

                  {/* Connections list */}
                  <div className="bg-bg-surface border border-border-default rounded-xl p-4">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                      Connections ({getConnections(selected.id).length})
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {getConnections(selected.id).map((conn, i) => {
                        const otherNode = nodes.find(n => n.id === conn.otherId);
                        return (
                          <button
                            key={i}
                            onClick={() => setSelected(otherNode ?? null)}
                            className={`w-full flex items-center justify-between text-left rounded-lg px-3 py-2 transition-colors group ${
                              conn.isSuspicious
                                ? 'bg-red-50 hover:bg-red-100 dark:bg-red-950/20'
                                : 'hover:bg-bg-surface-hover'
                            }`}
                          >
                            <span className="text-sm text-text-primary group-hover:text-primary truncate mr-2">
                              {entityTypeIcon(otherNode?.type ?? 'entity')} {conn.otherLabel}
                            </span>
                            <span className={`text-xs shrink-0 px-2 py-0.5 rounded-full ${
                              conn.isSuspicious
                                ? 'bg-red-100 text-red-700'
                                : 'bg-bg-surface text-text-tertiary border border-border-default'
                            }`}>
                              {conn.label}
                            </span>
                          </button>
                        );
                      })}
                      {getConnections(selected.id).length === 0 && (
                        <p className="text-xs text-text-tertiary text-center py-2">No connections</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Top-Risk Entity Table */}
      {!loading && !error && (
        <div className="bg-bg-surface border border-border-default rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-text-primary">Top-Risk Entities</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Ranked by AI fraud score — click to highlight in graph
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">Entity</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">Fraud Score</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">Connections</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary uppercase tracking-wide">Suspicious</th>
                </tr>
              </thead>
              <tbody>
                {filteredNodes
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, 12)
                  .map((entity, i) => {
                    const rc = riskColor(entity.riskScore);
                    const isSelected = selected?.id === entity.id;
                    return (
                      <tr
                        key={entity.id}
                        onClick={() => setSelected(isSelected ? null : entity)}
                        className={`border-b border-border-default cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5' : 'hover:bg-bg-surface-hover'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-medium text-text-primary">
                          {entityTypeIcon(entity.type)} {entity.label}
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary capitalize text-xs">
                          {entity.entityType.replace('_', ' ')}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-border-default rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${entity.riskScore}%`, backgroundColor: rc.dot }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${rc.text}`}>{entity.riskScore}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary">{entity.connectionCount}</td>
                        <td className="py-2.5 px-3">
                          {entity.suspiciousConnections > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              {entity.suspiciousConnections}
                            </span>
                          ) : (
                            <span className="text-xs text-text-tertiary">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {filteredNodes.length === 0 && (
              <p className="text-sm text-text-secondary text-center py-6">No entities match the filter.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
