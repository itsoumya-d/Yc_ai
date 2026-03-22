'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Types ──────────────────────────────────────────────────────────
export interface GraphNode {
  id: string;
  label: string;
  type: 'claim' | 'person' | 'entity';
  riskScore?: number;
  // Simulation coords (mutated by physics loop)
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number; // pinned x while dragging
  fy?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId?: string | null;
  onNodeSelect?: (node: GraphNode | null) => void;
  width?: number;
  height?: number;
}

// ── Color palette per type ─────────────────────────────────────────
const TYPE_COLORS: Record<string, { fill: string; stroke: string; text: string; glow: string }> = {
  claim:  { fill: '#FEE2E2', stroke: '#F87171', text: '#991B1B', glow: 'rgba(248,113,113,0.35)' },
  person: { fill: '#DBEAFE', stroke: '#60A5FA', text: '#1E3A5F', glow: 'rgba(96,165,250,0.35)' },
  entity: { fill: '#D1FAE5', stroke: '#34D399', text: '#064E3B', glow: 'rgba(52,211,153,0.35)' },
};

// ── Risk badge color ───────────────────────────────────────────────
function riskBadgeColor(score: number) {
  if (score >= 70) return '#EF4444';
  if (score >= 40) return '#F59E0B';
  return '#10B981';
}

// ── Simple force simulation (no dependency on D3) ──────────────────
function tick(nodes: GraphNode[], edges: GraphEdge[], centerX: number, centerY: number) {
  const alpha = 0.15;

  // Repulsion between all node pairs
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 3200 / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      if (a.fx === undefined) { a.vx -= fx * alpha; a.vy -= fy * alpha; }
      if (b.fx === undefined) { b.vx += fx * alpha; b.vy += fy * alpha; }
    }
  }

  // Attraction along edges (spring)
  for (const edge of edges) {
    const a = nodes.find(n => n.id === edge.source);
    const b = nodes.find(n => n.id === edge.target);
    if (!a || !b) continue;
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const idealDist = 160;
    const force = (dist - idealDist) * 0.02;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    if (a.fx === undefined) { a.vx += fx * alpha; a.vy += fy * alpha; }
    if (b.fx === undefined) { b.vx -= fx * alpha; b.vy -= fy * alpha; }
  }

  // Center gravity
  for (const node of nodes) {
    if (node.fx !== undefined) { node.x = node.fx; node.y = node.fy!; continue; }
    node.vx += (centerX - node.x) * 0.002;
    node.vy += (centerY - node.y) * 0.002;
    // Damping
    node.vx *= 0.88;
    node.vy *= 0.88;
    node.x += node.vx;
    node.y += node.vy;
  }
}

// ── Component ──────────────────────────────────────────────────────
export function ForceGraph({ nodes: initialNodes, edges, selectedNodeId, onNodeSelect, width = 700, height = 500 }: ForceGraphProps) {
  // Deep clone initial nodes so we own mutation
  const nodesRef = useRef<GraphNode[]>(
    initialNodes.map(n => ({ ...n, vx: 0, vy: 0 }))
  );
  const [, forceRender] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);
  const draggingRef = useRef<string | null>(null);

  // Zoom + pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Physics loop
  useEffect(() => {
    let running = true;
    function loop() {
      if (!running) return;
      tick(nodesRef.current, edges, width / 2, height / 2);
      forceRender(v => v + 1);
      animationRef.current = requestAnimationFrame(loop);
    }
    loop();
    return () => { running = false; cancelAnimationFrame(animationRef.current); };
  }, [edges, width, height]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    draggingRef.current = nodeId;
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node) { node.fx = node.x; node.fy = node.y; }
    (e.target as Element).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    // Node drag
    if (draggingRef.current) {
      const node = nodesRef.current.find(n => n.id === draggingRef.current);
      if (node && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        node.fx = (e.clientX - rect.left - pan.x) / zoom;
        node.fy = (e.clientY - rect.top - pan.y) / zoom;
      }
      return;
    }
    // Canvas pan
    if (panStart.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy });
    }
  }, [zoom, pan.x, pan.y]);

  const handlePointerUp = useCallback(() => {
    if (draggingRef.current) {
      const node = nodesRef.current.find(n => n.id === draggingRef.current);
      if (node) { node.fx = undefined; node.fy = undefined; }
      draggingRef.current = null;
    }
    panStart.current = null;
  }, []);

  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if (draggingRef.current) return;
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan.x, pan.y]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  }, []);

  // Resolved edge endpoints
  const nodeMap = useMemo(() => {
    const map = new Map<string, GraphNode>();
    nodesRef.current.forEach(n => map.set(n.id, n));
    return map;
  }, [forceRender]); // eslint-disable-line react-hooks/exhaustive-deps

  const connectedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>([selectedNodeId]);
    edges.forEach(e => {
      if (e.source === selectedNodeId) ids.add(e.target);
      if (e.target === selectedNodeId) ids.add(e.source);
    });
    return ids;
  }, [selectedNodeId, edges]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="select-none overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-[var(--border,#e2e8f0)]"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerDown={handleCanvasPointerDown}
      onWheel={handleWheel}
      style={{ touchAction: 'none' }}
    >
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#CBD5E1" strokeWidth="0.3" opacity="0.5" />
        </pattern>
        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={width} height={height} fill="url(#grid)" />

      <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
        {/* Edges */}
        {edges.map((edge, i) => {
          const s = nodeMap.get(edge.source);
          const t = nodeMap.get(edge.target);
          if (!s || !t) return null;
          const isHighlighted = selectedNodeId && (connectedIds.has(edge.source) && connectedIds.has(edge.target));
          const dimmed = selectedNodeId && !isHighlighted;
          const midX = (s.x + t.x) / 2;
          const midY = (s.y + t.y) / 2;
          return (
            <g key={`edge-${i}`} opacity={dimmed ? 0.15 : 1}>
              <line
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke={isHighlighted ? '#6366F1' : '#94A3B8'}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeDasharray={isHighlighted ? undefined : '6 3'}
              />
              <rect
                x={midX - edge.label.length * 3.5}
                y={midY - 8}
                width={edge.label.length * 7 + 8}
                height={16}
                rx={4}
                fill="white"
                stroke="#E2E8F0"
                strokeWidth={0.5}
              />
              <text
                x={midX}
                y={midY + 4}
                textAnchor="middle"
                fontSize={10}
                fill="#64748B"
                fontWeight={500}
              >
                {edge.label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodesRef.current.map(node => {
          const colors = TYPE_COLORS[node.type] ?? TYPE_COLORS.entity;
          const isSelected = node.id === selectedNodeId;
          const isConnected = connectedIds.has(node.id);
          const dimmed = selectedNodeId && !isConnected;
          const radius = node.type === 'claim' ? 32 : 26;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              opacity={dimmed ? 0.2 : 1}
              style={{ cursor: draggingRef.current === node.id ? 'grabbing' : 'grab', transition: 'opacity 0.3s' }}
              onPointerDown={e => handlePointerDown(e, node.id)}
              onClick={e => {
                e.stopPropagation();
                onNodeSelect?.(isSelected ? null : node);
              }}
            >
              {/* Glow ring on selected */}
              {isSelected && (
                <circle r={radius + 8} fill="none" stroke={colors.stroke} strokeWidth={3} opacity={0.4} filter="url(#glow)" />
              )}
              {/* Node circle */}
              <circle
                r={radius}
                fill={colors.fill}
                stroke={isSelected ? '#6366F1' : colors.stroke}
                strokeWidth={isSelected ? 3 : 2}
              />
              {/* Label */}
              <text
                y={1}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.type === 'claim' ? 11 : 10}
                fontWeight={600}
                fill={colors.text}
                style={{ pointerEvents: 'none' }}
              >
                {node.label.length > 12 ? node.label.slice(0, 11) + '…' : node.label}
              </text>
              {/* Risk badge */}
              {node.riskScore !== undefined && node.riskScore > 0 && (
                <g transform={`translate(${radius - 6},-${radius - 6})`}>
                  <circle r={10} fill={riskBadgeColor(node.riskScore)} />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={8}
                    fontWeight={700}
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                  >
                    {node.riskScore}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>

      {/* Zoom indicator */}
      <text x={width - 12} y={height - 12} textAnchor="end" fontSize={10} fill="#94A3B8" fontWeight={500}>
        {Math.round(zoom * 100)}%
      </text>
    </svg>
  );
}
