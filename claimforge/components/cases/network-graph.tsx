'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getEntityColor, getEntityLabel } from '@/lib/utils';
import type { NetworkNode, NetworkEdge, EntityType } from '@/types/database';

// ── Internal simulation types ──────────────────────────────────────────────
interface SimNode extends NetworkNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned: boolean;
}

interface ViewTransform {
  x: number;
  y: number;
  scale: number;
}

const W = 800;
const H = 480;
const BASE_RADIUS = 18;

// ── Force simulation constants ─────────────────────────────────────────────
const K_REPEL = 4500;
const K_SPRING = 0.011;
const K_GRAVITY = 0.0035;
const DAMPING = 0.84;
const REST_LENGTH = 140;
const SETTLE_THRESHOLD = 0.25;
const MAX_TICKS = 700;

// ── Entity type legend ─────────────────────────────────────────────────────
const ENTITY_TYPES: EntityType[] = ['person', 'organization', 'payment', 'contract', 'location', 'date'];

// ── NetworkGraph component ─────────────────────────────────────────────────
interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  loading?: boolean;
}

export function NetworkGraph({ nodes: initialNodes, edges, loading }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<SimNode[]>([]);
  const [display, setDisplay] = useState<SimNode[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [transform, setTransform] = useState<ViewTransform>({ x: 0, y: 0, scale: 1 });

  const rafRef = useRef<number>(0);
  const tickCount = useRef(0);
  const isDragging = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const isPanning = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const transformRef = useRef(transform);

  useEffect(() => { transformRef.current = transform; }, [transform]);

  // ── Initialize and run simulation ────────────────────────────────────────
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    tickCount.current = 0;

    if (!initialNodes.length) { setDisplay([]); return; }

    const cx = W / 2, cy = H / 2;
    // Place nodes evenly around a circle for fast convergence
    simRef.current = initialNodes.map((n, i) => {
      const angle = (i / initialNodes.length) * 2 * Math.PI;
      const r = Math.min(150, 60 + initialNodes.length * 4);
      return {
        ...n,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        pinned: false,
      };
    });

    const tick = () => {
      const ns = simRef.current;
      if (!ns.length) return;

      // Repulsion (all pairs)
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x - ns[i].x || 0.01;
          const dy = ns[j].y - ns[i].y || 0.01;
          const distSq = Math.max(dx * dx + dy * dy, 1);
          const dist = Math.sqrt(distSq);
          const f = K_REPEL / distSq;
          const fx = (dx / dist) * f;
          const fy = (dy / dist) * f;
          if (!ns[i].pinned) { ns[i].vx -= fx; ns[i].vy -= fy; }
          if (!ns[j].pinned) { ns[j].vx += fx; ns[j].vy += fy; }
        }
      }

      // Spring forces (edges)
      for (const edge of edges) {
        const src = ns.find(n => n.id === edge.source);
        const tgt = ns.find(n => n.id === edge.target);
        if (!src || !tgt) continue;
        const dx = tgt.x - src.x || 0.01;
        const dy = tgt.y - src.y || 0.01;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const f = (dist - REST_LENGTH) * K_SPRING * (edge.strength || 0.5);
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        if (!src.pinned) { src.vx += fx; src.vy += fy; }
        if (!tgt.pinned) { tgt.vx -= fx; tgt.vy -= fy; }
      }

      // Gravity + damping + integrate
      let maxV = 0;
      for (const n of ns) {
        if (n.pinned) continue;
        n.vx += (cx - n.x) * K_GRAVITY;
        n.vy += (cy - n.y) * K_GRAVITY;
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x = Math.max(BASE_RADIUS + 4, Math.min(W - BASE_RADIUS - 4, n.x + n.vx));
        n.y = Math.max(BASE_RADIUS + 4, Math.min(H - BASE_RADIUS - 4, n.y + n.vy));
        maxV = Math.max(maxV, Math.abs(n.vx), Math.abs(n.vy));
      }

      setDisplay([...ns]);
      tickCount.current++;

      if (maxV > SETTLE_THRESHOLD && tickCount.current < MAX_TICKS) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [initialNodes, edges]);

  // ── Mouse-to-graph coordinate conversion ─────────────────────────────────
  const toGraph = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const t = transformRef.current;
    return {
      x: ((clientX - rect.left) * scaleX - t.x) / t.scale,
      y: ((clientY - rect.top) * scaleY - t.y) / t.scale,
    };
  }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const pos = toGraph(e.clientX, e.clientY);
    const node = simRef.current.find(n => n.id === nodeId);
    if (node) {
      node.pinned = true;
      isDragging.current = { id: nodeId, ox: pos.x - node.x, oy: pos.y - node.y };
    }
  }, [toGraph]);

  const onSvgMouseDown = useCallback((e: React.MouseEvent) => {
    // Pan starts when clicking on background (not a node)
    if ((e.target as Element).closest('[data-node]')) return;
    const t = transformRef.current;
    isPanning.current = { startX: e.clientX, startY: e.clientY, tx: t.x, ty: t.y };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    // Drag node
    if (isDragging.current) {
      const pos = toGraph(e.clientX, e.clientY);
      const node = simRef.current.find(n => n.id === isDragging.current!.id);
      if (node) {
        node.x = Math.max(BASE_RADIUS + 4, Math.min(W - BASE_RADIUS - 4, pos.x - isDragging.current.ox));
        node.y = Math.max(BASE_RADIUS + 4, Math.min(H - BASE_RADIUS - 4, pos.y - isDragging.current.oy));
        node.vx = 0;
        node.vy = 0;
        setDisplay([...simRef.current]);
      }
      return;
    }

    // Pan
    if (isPanning.current) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const dx = (e.clientX - isPanning.current.startX) * scaleX;
      const dy = (e.clientY - isPanning.current.startY) * scaleY;
      setTransform({ ...isPanning.current, x: isPanning.current.tx + dx, y: isPanning.current.ty + dy });
    }
  }, [toGraph]);

  const onMouseUp = useCallback(() => {
    if (isDragging.current) {
      const node = simRef.current.find(n => n.id === isDragging.current!.id);
      if (node) {
        node.pinned = false;
        // Restart simulation briefly
        if (tickCount.current >= MAX_TICKS) {
          tickCount.current = MAX_TICKS - 100;
          const tick = () => {
            const ns = simRef.current;
            let maxV = 0;
            for (const n of ns) {
              if (n.pinned) continue;
              n.vx += (W / 2 - n.x) * K_GRAVITY;
              n.vy += (H / 2 - n.y) * K_GRAVITY;
              n.vx *= DAMPING;
              n.vy *= DAMPING;
              n.x = Math.max(BASE_RADIUS + 4, Math.min(W - BASE_RADIUS - 4, n.x + n.vx));
              n.y = Math.max(BASE_RADIUS + 4, Math.min(H - BASE_RADIUS - 4, n.y + n.vy));
              maxV = Math.max(maxV, Math.abs(n.vx), Math.abs(n.vy));
            }
            setDisplay([...ns]);
            tickCount.current++;
            if (maxV > SETTLE_THRESHOLD && tickCount.current < MAX_TICKS) {
              rafRef.current = requestAnimationFrame(tick);
            }
          };
          rafRef.current = requestAnimationFrame(tick);
        }
      }
      isDragging.current = null;
    }
    isPanning.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.88 : 1.14;
    setTransform(t => ({ ...t, scale: Math.max(0.25, Math.min(3.5, t.scale * factor)) }));
  }, []);

  const resetView = useCallback(() => setTransform({ x: 0, y: 0, scale: 1 }), []);

  const selectedNode = selected ? display.find(n => n.id === selected) : null;

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-xs text-text-tertiary">Building entity network…</p>
        </div>
      </div>
    );
  }

  if (!display.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border-default bg-bg-surface">
        <div className="text-center">
          <p className="text-sm text-text-secondary">No entity data available</p>
          <p className="mt-1 text-xs text-text-tertiary">Analyze documents to extract entities and build the network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-border-default bg-bg-surface overflow-hidden" style={{ height: 480 }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onMouseDown={onSvgMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <defs>
          <marker id="cf-arrow" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L7,2.5 Z" fill="#57534E" />
          </marker>
          <marker id="cf-arrow-red" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L7,2.5 Z" fill="#DC2626" />
          </marker>
          <filter id="cf-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cf-node-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid for depth */}
        <rect width={W} height={H} fill="transparent" />

        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
          {/* Edges */}
          {edges.map(edge => {
            const src = display.find(n => n.id === edge.source);
            const tgt = display.find(n => n.id === edge.target);
            if (!src || !tgt) return null;

            const flagged = src.flagged && tgt.flagged;
            const isSelected = selected === src.id || selected === tgt.id;

            // Shorten edge to not overlap node circles
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const r = BASE_RADIUS + 2;
            const x1 = src.x + (dx / dist) * r;
            const y1 = src.y + (dy / dist) * r;
            const x2 = tgt.x - (dx / dist) * (r + 8);
            const y2 = tgt.y - (dy / dist) * (r + 8);

            return (
              <g key={edge.id}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={flagged ? '#DC262680' : isSelected ? '#3B82F680' : '#44403C'}
                  strokeWidth={isSelected ? 2 : 1.5}
                  strokeDasharray={flagged ? '5,3' : undefined}
                  markerEnd={`url(#${flagged ? 'cf-arrow-red' : 'cf-arrow'})`}
                  opacity={selected && !isSelected ? 0.25 : 0.7}
                />
                {edge.label && edge.label !== 'co-occurs' && isSelected && (
                  <text
                    x={(src.x + tgt.x) / 2}
                    y={(src.y + tgt.y) / 2 - 8}
                    textAnchor="middle"
                    fill="#78716C"
                    fontSize={8}
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {edge.label.length > 16 ? edge.label.slice(0, 16) + '…' : edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {display.map(node => {
            const color = getEntityColor(node.type);
            const isSelected = selected === node.id;
            const r = BASE_RADIUS + Math.min(8, Math.max(0, (node.size - 14) * 0.4));
            const dimmed = selected !== null && !isSelected;

            return (
              <g
                key={node.id}
                data-node="true"
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: 'pointer' }}
                onMouseDown={e => onNodeMouseDown(e, node.id)}
                onClick={() => setSelected(prev => prev === node.id ? null : node.id)}
              >
                {/* Flagged pulsing ring */}
                {node.flagged && (
                  <circle
                    r={r + 6}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth={1.5}
                    strokeDasharray="4,3"
                    className="fraud-pulse"
                    opacity={0.7}
                  />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    r={r + 9}
                    fill={color + '15'}
                    stroke={color}
                    strokeWidth={1.5}
                    className="node-glow"
                    filter="url(#cf-glow)"
                  />
                )}

                {/* Main node circle */}
                <circle
                  r={r}
                  fill={color + (dimmed ? '25' : '28')}
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  opacity={dimmed ? 0.4 : 1}
                  filter={isSelected ? 'url(#cf-node-glow)' : undefined}
                />

                {/* Entity type initial */}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fontSize={r > 18 ? 10 : 9}
                  fontWeight={700}
                  fontFamily="'JetBrains Mono', monospace"
                  opacity={dimmed ? 0.4 : 1}
                >
                  {node.type[0].toUpperCase()}
                </text>

                {/* Label below */}
                <text
                  y={r + 12}
                  textAnchor="middle"
                  fill={dimmed ? '#44403C' : '#A8A29E'}
                  fontSize={9}
                  fontFamily="'Inter', system-ui, sans-serif"
                >
                  {node.label.length > 13 ? node.label.slice(0, 13) + '…' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        {[
          { label: '+', action: () => setTransform(t => ({ ...t, scale: Math.min(t.scale * 1.25, 3.5) })) },
          { label: '−', action: () => setTransform(t => ({ ...t, scale: Math.max(t.scale * 0.8, 0.25) })) },
          { label: '⌂', action: resetView },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border-default bg-bg-surface-raised text-xs text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border border-border-muted bg-bg-overlay/90 px-3 py-2 backdrop-blur-sm">
        {ENTITY_TYPES.map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getEntityColor(type) }} />
            <span className="text-[10px] text-text-tertiary">{getEntityLabel(type)}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-0 w-4 border-t-2 border-dashed border-fraud-red" />
          <span className="text-[10px] text-fraud-red">Flagged</span>
        </div>
      </div>

      {/* Selected node info card */}
      {selectedNode && (
        <div className="absolute left-3 top-3 max-w-[200px] rounded-xl border border-border-default bg-bg-overlay/95 p-3.5 backdrop-blur-sm shadow-lg">
          <div className="mb-2 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: getEntityColor(selectedNode.type) }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              {getEntityLabel(selectedNode.type)}
            </span>
          </div>
          <p className="text-sm font-medium leading-snug text-text-primary">{selectedNode.label}</p>
          <div className="mt-2 space-y-1 text-[10px] text-text-tertiary">
            <div>
              <span>Connections: </span>
              <span className="text-text-secondary financial-figure">
                {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length}
              </span>
            </div>
            {selectedNode.flagged && (
              <div className="flex items-center gap-1 text-fraud-red">
                <span>⚠</span>
                <span className="font-medium">High-confidence entity</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSelected(null)}
            className="mt-2 text-[10px] text-text-tertiary hover:text-text-secondary transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats bar */}
      <div className="absolute bottom-3 right-3 rounded-md border border-border-muted bg-bg-overlay/80 px-2.5 py-1 backdrop-blur-sm">
        <span className="financial-figure text-[10px] text-text-tertiary">
          {display.length} nodes · {edges.length} edges
        </span>
      </div>
    </div>
  );
}
