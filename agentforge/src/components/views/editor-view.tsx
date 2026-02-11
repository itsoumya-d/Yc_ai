import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn, getNodeColor, getNodeLabel } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { AgentNodeType } from '@/types/database';
import {
  Play,
  Square,
  Search,
  Brain,
  Wrench,
  Database,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Shield,
  Sparkles,
  Zap,
  ChevronDown,
  Settings,
  X,
} from 'lucide-react';

// ===== Node type icons =====
const nodeIcons: Record<AgentNodeType, React.ComponentType<{ className?: string }>> = {
  llm: Brain,
  tool: Wrench,
  memory: Database,
  condition: GitBranch,
  output: ArrowRight,
  input: ArrowLeft,
  guardrail: Shield,
  custom: Sparkles,
  transform: Zap,
};

// ===== Custom Agent Node Component =====
function AgentNodeComponent({ data, selected }: NodeProps) {
  const nodeType = (data.nodeType as AgentNodeType) || 'llm';
  const color = getNodeColor(nodeType);
  const label = (data.label as string) || getNodeLabel(nodeType);
  const subtitle = (data.subtitle as string) || '';
  const Icon = nodeIcons[nodeType] ?? Brain;

  return (
    <div
      className={cn(
        'relative min-w-[220px] max-w-[300px] rounded-xl border bg-bg-surface-raised shadow-2 transition-all',
        selected ? 'border-primary shadow-[0_0_0_1px_#3B82F6]' : 'border-border-default hover:border-border-emphasis'
      )}
      style={{ borderLeftWidth: '3px', borderLeftColor: color }}
    >
      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-bg-surface-raised !bg-border-emphasis" />

      {/* Header */}
      <div className="flex items-center gap-2 rounded-t-xl px-3 py-2" style={{ backgroundColor: `${color}15` }}>
        <div className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: `${color}25` }}>
          <span style={{ color }}><Icon className="h-3 w-3" /></span>
        </div>
        <span className="text-xs font-medium text-text-primary">{label}</span>
      </div>

      {/* Body */}
      {subtitle && (
        <div className="border-t border-border-subtle px-3 py-2">
          <p className="text-[11px] text-text-secondary">{subtitle}</p>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-bg-surface-raised !bg-border-emphasis" />
    </div>
  );
}

// Define nodeTypes OUTSIDE component to prevent re-renders
const nodeTypes = { agentNode: AgentNodeComponent };

// ===== Initial nodes and edges =====
const initialNodes: Node[] = [
  { id: 'n1', type: 'agentNode', position: { x: 350, y: 50 }, data: { nodeType: 'input', label: 'User Input', subtitle: 'Agent entry point' } },
  { id: 'n2', type: 'agentNode', position: { x: 350, y: 200 }, data: { nodeType: 'llm', label: 'LLM Call', subtitle: 'OpenAI GPT-4o' } },
  { id: 'n3', type: 'agentNode', position: { x: 100, y: 350 }, data: { nodeType: 'tool', label: 'Web Search', subtitle: 'Serper API' } },
  { id: 'n4', type: 'agentNode', position: { x: 600, y: 350 }, data: { nodeType: 'tool', label: 'Order Lookup', subtitle: 'Database Query' } },
  { id: 'n5', type: 'agentNode', position: { x: 350, y: 500 }, data: { nodeType: 'condition', label: 'Needs Escalation?', subtitle: 'Check severity' } },
  { id: 'n6', type: 'agentNode', position: { x: 150, y: 650 }, data: { nodeType: 'output', label: 'Response', subtitle: 'Agent reply' } },
  { id: 'n7', type: 'agentNode', position: { x: 550, y: 650 }, data: { nodeType: 'guardrail', label: 'Content Filter', subtitle: 'Safety check' } },
];

const initialEdges: Edge[] = [
  { id: 'e1', source: 'n1', target: 'n2', animated: false },
  { id: 'e2', source: 'n2', target: 'n3', animated: false },
  { id: 'e3', source: 'n2', target: 'n4', animated: false },
  { id: 'e4', source: 'n3', target: 'n5', animated: false },
  { id: 'e5', source: 'n4', target: 'n5', animated: false },
  { id: 'e6', source: 'n5', target: 'n6', animated: false, label: 'No' },
  { id: 'e7', source: 'n5', target: 'n7', animated: false, label: 'Yes' },
];

// ===== Node Library =====
const nodeLibrary: { category: string; types: { type: AgentNodeType; label: string; description: string }[] }[] = [
  {
    category: 'LLM',
    types: [
      { type: 'llm', label: 'LLM Call', description: 'Call a language model' },
    ],
  },
  {
    category: 'Tools',
    types: [
      { type: 'tool', label: 'Web Search', description: 'Search the web' },
      { type: 'tool', label: 'HTTP Request', description: 'Make API calls' },
      { type: 'tool', label: 'Database Query', description: 'Query a database' },
      { type: 'tool', label: 'Code Execute', description: 'Run code snippets' },
    ],
  },
  {
    category: 'Memory',
    types: [
      { type: 'memory', label: 'Buffer Memory', description: 'Short-term memory' },
      { type: 'memory', label: 'RAG', description: 'Retrieval augmented generation' },
    ],
  },
  {
    category: 'Logic',
    types: [
      { type: 'condition', label: 'Condition', description: 'Branch on condition' },
      { type: 'transform', label: 'Transform', description: 'Transform data' },
    ],
  },
  {
    category: 'I/O',
    types: [
      { type: 'input', label: 'Input', description: 'Agent entry point' },
      { type: 'output', label: 'Output', description: 'Agent response' },
    ],
  },
  {
    category: 'Safety',
    types: [
      { type: 'guardrail', label: 'Content Filter', description: 'Filter unsafe content' },
      { type: 'guardrail', label: 'PII Detector', description: 'Detect personal information' },
    ],
  },
];

// ===== Console Log Entries =====
const consoleLogs = [
  { time: '14:32:01', level: 'info' as const, message: 'Agent execution started' },
  { time: '14:32:01', level: 'info' as const, message: 'Node "Input" received: "Help with my order"' },
  { time: '14:32:01', level: 'info' as const, message: 'Node "LLM Call" executing (GPT-4o)...' },
  { time: '14:32:02', level: 'info' as const, message: 'Node "LLM Call" completed (890ms, 342 tokens)' },
  { time: '14:32:02', level: 'warn' as const, message: 'Token usage at 78% of context window' },
  { time: '14:32:02', level: 'info' as const, message: 'Node "Order Lookup" executing...' },
  { time: '14:32:03', level: 'info' as const, message: 'Node "Order Lookup" completed (210ms)' },
  { time: '14:32:03', level: 'info' as const, message: 'Total: 7 nodes, 1.2s, 890 tokens, $0.0045' },
];

const logLevelColors: Record<string, string> = {
  info: 'text-text-secondary',
  warn: 'text-warning',
  error: 'text-error',
  debug: 'text-text-tertiary',
};

function EditorCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { isExecuting, setIsExecuting, nodeLibraryOpen, propertiesPanelOpen, consolePanelOpen, selectedNodeId, setSelectedNodeId } = useAppStore();
  const [librarySearch, setLibrarySearch] = useState('');

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, [setSelectedNodeId]);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId), [nodes, selectedNodeId]);

  const filteredLibrary = nodeLibrary
    .map((cat) => ({
      ...cat,
      types: cat.types.filter(
        (t) => t.label.toLowerCase().includes(librarySearch.toLowerCase()) || t.description.toLowerCase().includes(librarySearch.toLowerCase())
      ),
    }))
    .filter((cat) => cat.types.length > 0);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border-default bg-bg-surface px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-text-primary">Customer Support Bot</span>
          <span className="rounded bg-bg-surface-hover px-1.5 py-0.5 text-[10px] text-text-tertiary">v2.3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExecuting(!isExecuting)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              isExecuting
                ? 'bg-error/10 text-error hover:bg-error/20'
                : 'bg-primary text-text-on-color hover:bg-primary-active'
            )}
          >
            {isExecuting ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isExecuting ? 'Stop' : 'Run'}
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Library */}
        {nodeLibraryOpen && (
          <div className="flex w-52 flex-col border-r border-border-default bg-bg-surface">
            <div className="border-b border-border-subtle p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="h-7 w-full rounded border border-border-default bg-bg-surface-raised pl-7 pr-2 text-[11px] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-3">
              {filteredLibrary.map((cat) => (
                <div key={cat.category}>
                  <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">{cat.category}</div>
                  <div className="space-y-1">
                    {cat.types.map((nodeType, i) => {
                      const Icon = nodeIcons[nodeType.type] ?? Brain;
                      const color = getNodeColor(nodeType.type);
                      return (
                        <div
                          key={`${cat.category}-${i}`}
                          className="flex cursor-grab items-center gap-2 rounded-md border border-border-subtle px-2 py-1.5 transition-colors hover:border-border-default hover:bg-bg-surface-hover"
                          draggable
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded" style={{ backgroundColor: `${color}20` }}>
                            <span style={{ color }}><Icon className="h-3 w-3" /></span>
                          </div>
                          <div>
                            <div className="text-[11px] font-medium text-text-primary">{nodeType.label}</div>
                            <div className="text-[10px] text-text-tertiary">{nodeType.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              defaultEdgeOptions={{
                style: { stroke: '#30363D', strokeWidth: 2 },
                type: 'smoothstep',
              }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#21262D" />
              <Controls showInteractive={false} />
              <MiniMap
                nodeColor={(node) => {
                  const nt = node.data?.nodeType as AgentNodeType | undefined;
                  return nt ? getNodeColor(nt) : '#6E7681';
                }}
                maskColor="rgba(13, 17, 23, 0.7)"
              />
            </ReactFlow>
          </div>

          {/* Console */}
          {consolePanelOpen && (
            <div className="flex h-40 flex-col border-t border-border-default bg-bg-surface">
              <div className="flex items-center justify-between border-b border-border-subtle px-3 py-1">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium text-text-primary">Console</span>
                  <span className="text-[11px] text-text-tertiary">Problems</span>
                  <span className="text-[11px] text-text-tertiary">Tokens</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="text-[10px] text-text-tertiary hover:text-text-secondary">Clear</button>
                  <button className="text-[10px] text-text-tertiary hover:text-text-secondary">Copy</button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2 font-mono text-[11px]">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 py-0.5">
                    <span className="text-text-tertiary">{log.time}</span>
                    <span className={cn('font-medium', logLevelColors[log.level] ?? 'text-text-secondary')}>[{log.level.toUpperCase()}]</span>
                    <span className="text-text-primary">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {propertiesPanelOpen && selectedNode && (
          <div className="flex w-72 flex-col border-l border-border-default bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
              <span className="text-xs font-medium text-text-primary">Node Properties</span>
              <button onClick={() => setSelectedNodeId(null)}>
                <X className="h-3.5 w-3.5 text-text-tertiary hover:text-text-secondary" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3 space-y-4">
              {/* Node type header */}
              <div className="flex items-center gap-2">
                {(() => {
                  const nt = (selectedNode.data?.nodeType as AgentNodeType) || 'llm';
                  const Icon = nodeIcons[nt] ?? Brain;
                  const color = getNodeColor(nt);
                  return (
                    <>
                      <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: `${color}20` }}>
                        <span style={{ color }}><Icon className="h-3.5 w-3.5" /></span>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-text-primary">{(selectedNode.data?.label as string) || getNodeLabel(nt)}</div>
                        <div className="text-[10px] text-text-tertiary">{getNodeLabel(nt)} Node</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Basic Config */}
              <div>
                <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Basic</div>
                <div className="space-y-2">
                  <div>
                    <label className="mb-1 block text-[11px] text-text-secondary">Provider</label>
                    <div className="flex h-8 items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-2.5 text-xs text-text-primary">
                      <span>OpenAI</span>
                      <ChevronDown className="h-3 w-3 text-text-tertiary" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-text-secondary">Model</label>
                    <div className="flex h-8 items-center justify-between rounded-md border border-border-default bg-bg-surface-raised px-2.5 text-xs text-text-primary">
                      <span>GPT-4o</span>
                      <ChevronDown className="h-3 w-3 text-text-tertiary" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-text-secondary">Temperature</label>
                    <div className="flex items-center gap-2">
                      <div className="relative h-1 flex-1 rounded-full bg-border-default">
                        <div className="absolute left-0 top-0 h-full w-[35%] rounded-full bg-primary" />
                        <div className="absolute left-[35%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-bg-surface-raised" />
                      </div>
                      <span className="font-mono text-[11px] text-text-primary">0.7</span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-text-secondary">Max Tokens</label>
                    <input
                      type="number"
                      defaultValue={4096}
                      className="h-8 w-full rounded-md border border-border-default bg-bg-surface-raised px-2.5 font-mono text-xs text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Config */}
              <div>
                <div className="flex cursor-pointer items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Advanced</span>
                  <ChevronDown className="h-3 w-3 text-text-tertiary" />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-1.5">
                <button className="flex w-full items-center gap-2 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                  <Settings className="h-3 w-3" />
                  Edit System Prompt
                </button>
                <button className="flex w-full items-center gap-2 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
                  <Play className="h-3 w-3" />
                  Test This Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EditorView() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  );
}
