import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn, getNodeColor } from '@/lib/utils';
import type { NodeType } from '@/types/database';
import {
  Database,
  ImageIcon,
  SplitSquareHorizontal,
  Sparkles,
  Cpu,
  BarChart3,
  Upload,
  Code2,
  Play,
  Save,
  FileDown,
  X,
  CheckCircle2,
  AlertCircle,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  Layers,
} from 'lucide-react';

// ===== Types =====

interface MLNodeData {
  label: string;
  nodeType: NodeType;
  configPreview?: string;
  status?: 'idle' | 'running' | 'completed' | 'failed';
  config?: Record<string, string | number | boolean>;
  [key: string]: unknown;
}

// ===== Node type metadata =====

const nodeTypeIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  csv_loader: Database,
  image_loader: ImageIcon,
  hf_dataset: Database,
  data_split: SplitSquareHorizontal,
  normalize: Sparkles,
  augment: Sparkles,
  custom_transform: Code2,
  pytorch_train: Cpu,
  tensorflow_train: Cpu,
  evaluate: BarChart3,
  export_model: Upload,
};

// Node categories define which port types they accept/produce
const nodeCategories: Record<string, { category: string; inputType: string | null; outputType: string }> = {
  csv_loader: { category: 'data', inputType: null, outputType: 'dataset' },
  image_loader: { category: 'data', inputType: null, outputType: 'dataset' },
  hf_dataset: { category: 'data', inputType: null, outputType: 'dataset' },
  data_split: { category: 'transform', inputType: 'dataset', outputType: 'dataset' },
  normalize: { category: 'transform', inputType: 'dataset', outputType: 'dataset' },
  augment: { category: 'transform', inputType: 'dataset', outputType: 'dataset' },
  custom_transform: { category: 'transform', inputType: 'dataset', outputType: 'dataset' },
  pytorch_train: { category: 'train', inputType: 'dataset', outputType: 'model' },
  tensorflow_train: { category: 'train', inputType: 'dataset', outputType: 'model' },
  evaluate: { category: 'evaluate', inputType: 'model', outputType: 'report' },
  export_model: { category: 'deploy', inputType: 'model', outputType: 'artifact' },
};

// Default configs for each node type
const defaultNodeConfigs: Record<string, Record<string, string | number | boolean>> = {
  csv_loader: { file_path: '', delimiter: ',', header: true },
  image_loader: { root_path: '', image_size: 224, augment: false },
  hf_dataset: { dataset_name: '', split: 'train', subset: '' },
  data_split: { train_ratio: 0.8, test_ratio: 0.2, stratify: true, seed: 42 },
  normalize: { method: 'standard', fit_on_train: true },
  augment: { flip_horizontal: true, rotation: 15, crop_scale: 0.8 },
  custom_transform: { code: 'def transform(self, x):\n    return x' },
  pytorch_train: { epochs: 20, learning_rate: 0.0001, batch_size: 32, optimizer: 'AdamW' },
  tensorflow_train: { epochs: 20, learning_rate: 0.001, batch_size: 32 },
  evaluate: { metrics: 'accuracy,f1,precision', threshold: 0.5 },
  export_model: { format: 'safetensors', version: 'v1.0.0' },
};

// ===== Custom ML Node Component =====

function MLNode({ data, selected }: NodeProps) {
  const nodeData = data as MLNodeData;
  const color = getNodeColor(nodeData.nodeType);
  const Icon = nodeTypeIcons[nodeData.nodeType] ?? Code2;
  const meta = nodeCategories[nodeData.nodeType];

  return (
    <div
      className={cn(
        'w-[220px] rounded-lg border bg-bg-surface shadow-node transition-all',
        selected ? 'ring-2 ring-primary' : ''
      )}
      style={{
        borderColor: selected ? color : `${color}4D`,
        backgroundColor: `${color}08`,
      }}
    >
      {/* Input Handle */}
      {meta?.inputType && (
        <Handle
          type="target"
          position={Position.Top}
          id="input"
          className="!w-3 !h-3 !bg-bg-surface !border-2 !-top-1.5"
          style={{ borderColor: color }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: `${color}26` }}>
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          <span className="text-xs font-medium text-text-primary">{nodeData.label}</span>
        </div>
        <div className="flex items-center gap-1">
          {nodeData.status === 'running' && (
            <div className="h-2 w-2 rounded-full animate-node-pulse" style={{ backgroundColor: color }} />
          )}
          {nodeData.status === 'completed' && (
            <CheckCircle2 className="h-3 w-3 text-success" />
          )}
          {nodeData.status === 'failed' && (
            <AlertCircle className="h-3 w-3 text-error" />
          )}
        </div>
      </div>

      {/* Config preview */}
      <div className="px-3 py-2">
        {nodeData.configPreview ? (
          <div className="font-mono text-[10px] leading-4 text-text-tertiary whitespace-pre-wrap">
            {nodeData.configPreview}
          </div>
        ) : (
          <div className="text-[10px] text-text-tertiary italic">Click to configure</div>
        )}
      </div>

      {/* Output Handle */}
      {meta?.outputType && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output"
          className="!w-3 !h-3 !bg-bg-surface !border-2 !-bottom-1.5"
          style={{ borderColor: color }}
        />
      )}
    </div>
  );
}

// Define nodeTypes OUTSIDE component for React Flow performance
const nodeTypes: NodeTypes = {
  mlNode: MLNode,
};

// ===== Node Palette Config =====

const nodePaletteItems = [
  { category: 'Data', color: '#10B981', items: [
    { type: 'csv_loader' as NodeType, label: 'CSV Loader', icon: Database },
    { type: 'image_loader' as NodeType, label: 'Image Loader', icon: ImageIcon },
    { type: 'hf_dataset' as NodeType, label: 'HF Dataset', icon: Database },
  ]},
  { category: 'Transform', color: '#F59E0B', items: [
    { type: 'data_split' as NodeType, label: 'Data Split', icon: SplitSquareHorizontal },
    { type: 'normalize' as NodeType, label: 'Normalize', icon: Sparkles },
    { type: 'augment' as NodeType, label: 'Augment', icon: Sparkles },
    { type: 'custom_transform' as NodeType, label: 'Custom', icon: Code2 },
  ]},
  { category: 'Train', color: '#3B82F6', items: [
    { type: 'pytorch_train' as NodeType, label: 'PyTorch', icon: Cpu },
    { type: 'tensorflow_train' as NodeType, label: 'TensorFlow', icon: Cpu },
  ]},
  { category: 'Evaluate', color: '#8B5CF6', items: [
    { type: 'evaluate' as NodeType, label: 'Evaluate', icon: BarChart3 },
  ]},
  { category: 'Deploy', color: '#EF4444', items: [
    { type: 'export_model' as NodeType, label: 'Export Model', icon: Upload },
  ]},
];

// ===== Demo pipeline =====

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'mlNode',
    position: { x: 100, y: 100 },
    data: { label: 'Load Dataset', nodeType: 'csv_loader', configPreview: 'train.csv (10,000 rows)', status: 'completed', config: { file_path: 'train.csv', delimiter: ',', header: true } } as MLNodeData,
  },
  {
    id: '2',
    type: 'mlNode',
    position: { x: 100, y: 280 },
    data: { label: 'Train/Test Split', nodeType: 'data_split', configPreview: 'ratio: 0.8 / 0.2\nstratify: true', status: 'completed', config: { train_ratio: 0.8, test_ratio: 0.2, stratify: true, seed: 42 } } as MLNodeData,
  },
  {
    id: '3',
    type: 'mlNode',
    position: { x: 100, y: 460 },
    data: { label: 'Normalize', nodeType: 'normalize', configPreview: 'method: standard\nfit_on: train_only', status: 'completed', config: { method: 'standard', fit_on_train: true } } as MLNodeData,
  },
  {
    id: '4',
    type: 'mlNode',
    position: { x: 420, y: 280 },
    data: { label: 'Train BERT', nodeType: 'pytorch_train', configPreview: 'epochs: 20, lr: 1e-4\nbatch_size: 32, optimizer: AdamW', status: 'running', config: { epochs: 20, learning_rate: 0.0001, batch_size: 32, optimizer: 'AdamW' } } as MLNodeData,
  },
  {
    id: '5',
    type: 'mlNode',
    position: { x: 420, y: 460 },
    data: { label: 'Evaluate', nodeType: 'evaluate', configPreview: 'metrics: accuracy, f1, precision\nthreshold: 0.5', status: 'idle', config: { metrics: 'accuracy,f1,precision', threshold: 0.5 } } as MLNodeData,
  },
  {
    id: '6',
    type: 'mlNode',
    position: { x: 720, y: 370 },
    data: { label: 'Export Model', nodeType: 'export_model', configPreview: 'format: safetensors\nversion: v1.0.0', status: 'idle', config: { format: 'safetensors', version: 'v1.0.0' } } as MLNodeData,
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', sourceHandle: 'output', targetHandle: 'input', animated: false, style: { stroke: '#10B981', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', sourceHandle: 'output', targetHandle: 'input', animated: false, style: { stroke: '#F59E0B', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', sourceHandle: 'output', targetHandle: 'input', animated: true, style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e4-5', source: '4', target: '5', sourceHandle: 'output', targetHandle: 'input', animated: false, style: { stroke: '#3B82F6', strokeWidth: 2 } },
  { id: 'e5-6', source: '5', target: '6', sourceHandle: 'output', targetHandle: 'input', animated: false, style: { stroke: '#8B5CF6', strokeWidth: 2 } },
];

// ===== Node Config Panel =====

function NodeConfigPanel({
  node,
  onClose,
  onUpdate,
}: {
  node: Node;
  onClose: () => void;
  onUpdate: (id: string, config: Record<string, string | number | boolean>) => void;
}) {
  const nodeData = node.data as MLNodeData;
  const color = getNodeColor(nodeData.nodeType);
  const Icon = nodeTypeIcons[nodeData.nodeType] ?? Code2;
  const config = nodeData.config ?? defaultNodeConfigs[nodeData.nodeType] ?? {};

  const handleChange = (key: string, value: string | number | boolean) => {
    onUpdate(node.id, { ...config, [key]: value });
  };

  return (
    <div className="w-72 overflow-auto border-l border-border-default bg-bg-surface">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border-default px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          <span className="text-xs font-semibold text-text-primary">{nodeData.label}</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Node Type Badge */}
      <div className="border-b border-border-subtle px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${color}20`, color }}>
            {nodeData.nodeType.replace(/_/g, ' ')}
          </span>
          {nodeData.status && (
            <span className={cn(
              'rounded-full px-2 py-0.5 text-[10px] capitalize',
              nodeData.status === 'completed' ? 'bg-success/10 text-success' :
              nodeData.status === 'running' ? 'bg-info/10 text-info' :
              nodeData.status === 'failed' ? 'bg-error/10 text-error' :
              'bg-bg-surface-hover text-text-tertiary'
            )}>
              {nodeData.status}
            </span>
          )}
        </div>
      </div>

      {/* Config Fields */}
      <div className="p-3 space-y-3">
        <div className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Configuration</div>
        {Object.entries(config).map(([key, value]) => (
          <div key={key}>
            <label className="mb-1 block text-[10px] font-medium text-text-tertiary">
              {key.replace(/_/g, ' ')}
            </label>
            {typeof value === 'boolean' ? (
              <button
                onClick={() => handleChange(key, !value)}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors',
                  value
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border-default bg-bg-root text-text-tertiary'
                )}
              >
                <div className={cn(
                  'h-3 w-3 rounded-sm border',
                  value ? 'border-primary bg-primary' : 'border-border-strong'
                )} />
                {value ? 'Enabled' : 'Disabled'}
              </button>
            ) : typeof value === 'number' ? (
              <input
                type="number"
                value={value}
                onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                step={value < 1 ? 0.0001 : 1}
                className="w-full rounded-md border border-border-default bg-bg-root px-2.5 py-1.5 font-mono text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            ) : String(value).includes('\n') ? (
              <textarea
                value={String(value)}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border-default bg-bg-root px-2.5 py-1.5 font-mono text-[11px] text-text-primary focus:border-primary focus:outline-none resize-none"
              />
            ) : (
              <input
                type="text"
                value={String(value)}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full rounded-md border border-border-default bg-bg-root px-2.5 py-1.5 font-mono text-xs text-text-primary focus:border-primary focus:outline-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="border-t border-border-subtle p-3 flex items-center gap-2">
        <button
          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Apply
        </button>
        <button
          onClick={onClose}
          className="flex-1 rounded-md border border-border-default px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ===== Main Pipeline View (inner, needs ReactFlowProvider) =====

function PipelineViewInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showNodePalette] = useState(true);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { getNodes, getEdges } = useReactFlow();

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Save to history
  const saveToHistory = useCallback(() => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ nodes: currentNodes, edges: currentEdges });
      return newHistory.slice(-50); // keep last 50 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [getNodes, getEdges, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      if (prev) {
        setNodes(prev.nodes);
        setEdges(prev.edges);
        setHistoryIndex(historyIndex - 1);
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      if (next) {
        setNodes(next.nodes);
        setEdges(next.edges);
        setHistoryIndex(historyIndex + 1);
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Connection validation
  const isValidConnection = useCallback((connection: Edge | Connection) => {
    if (!connection.source || !connection.target) return false;
    if (connection.source === connection.target) return false;

    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (!sourceNode || !targetNode) return false;

    const sourceData = sourceNode.data as MLNodeData;
    const targetData = targetNode.data as MLNodeData;
    const sourceMeta = nodeCategories[sourceData.nodeType];
    const targetMeta = nodeCategories[targetData.nodeType];
    if (!sourceMeta || !targetMeta) return false;

    // Type-check: source output type must be compatible with target input
    if (targetMeta.inputType === 'dataset') {
      return sourceMeta.outputType === 'dataset';
    }
    if (targetMeta.inputType === 'model') {
      return sourceMeta.outputType === 'model';
    }
    return true;
  }, [nodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const sourceData = sourceNode?.data as MLNodeData | undefined;
      const color = sourceData ? getNodeColor(sourceData.nodeType) : '#3F3F46';
      setEdges((eds) => addEdge({ ...connection, animated: false, style: { stroke: color, strokeWidth: 2 } }, eds));
      saveToHistory();
    },
    [setEdges, nodes, saveToHistory]
  );

  const addNode = useCallback(
    (type: NodeType, label: string) => {
      const config = defaultNodeConfigs[type] ?? {};
      const configPreview = Object.entries(config)
        .slice(0, 3)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'mlNode',
        position: { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
        data: { label, nodeType: type, status: 'idle', config, configPreview } as MLNodeData,
      };
      setNodes((nds) => [...nds, newNode]);
      saveToHistory();
    },
    [setNodes, saveToHistory]
  );

  const deleteSelectedNodes = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => {
      const selectedNodeIds = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
      return eds.filter((e) => !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target));
    });
    setSelectedNodeId(null);
    saveToHistory();
  }, [setNodes, setEdges, nodes, saveToHistory]);

  const duplicateSelectedNodes = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    const newNodes = selected.map((n) => ({
      ...n,
      id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      position: { x: n.position.x + 40, y: n.position.y + 40 },
      selected: false,
    }));
    setNodes((nds) => [...nds, ...newNodes]);
    saveToHistory();
  }, [nodes, setNodes, saveToHistory]);

  const updateNodeConfig = useCallback((nodeId: string, config: Record<string, string | number | boolean>) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n;
        const configPreview = Object.entries(config)
          .slice(0, 3)
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n');
        return {
          ...n,
          data: { ...n.data, config, configPreview },
        };
      })
    );
  }, [setNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && !e.metaKey && !e.ctrlKey) {
        deleteSelectedNodes();
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === 'z' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'd' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        duplicateSelectedNodes();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelectedNodes, duplicateSelectedNodes, undo, redo]);

  // Track node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Pipeline validation
  const validationErrors: string[] = [];
  const nodesWithoutInputs = nodes.filter((n) => {
    const data = n.data as MLNodeData;
    const meta = nodeCategories[data.nodeType];
    if (!meta?.inputType) return false;
    return !edges.some((e) => e.target === n.id);
  });
  if (nodesWithoutInputs.length > 0) {
    nodesWithoutInputs.forEach((n) => {
      const data = n.data as MLNodeData;
      validationErrors.push(`"${data.label}" has no input connection`);
    });
  }

  return (
    <div className="flex h-full">
      {/* Node Palette (Left Panel) */}
      {showNodePalette && (
        <div className="w-52 overflow-auto border-r border-border-default bg-bg-surface p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-heading text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Nodes
            </h3>
          </div>

          {nodePaletteItems.map((category) => (
            <div key={category.category} className="mb-4">
              <div className="mb-1.5 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                  {category.category}
                </span>
              </div>
              <div className="space-y-1">
                {category.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => addNode(item.type, item.label)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover hover:text-text-primary"
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: category.color }} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 border-t border-border-subtle pt-3">
            <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider mb-1.5">Shortcuts</div>
            <div className="space-y-1 text-[10px] text-text-tertiary">
              <div className="flex justify-between"><span>Delete node</span><kbd className="rounded bg-bg-surface-hover px-1">Del</kbd></div>
              <div className="flex justify-between"><span>Undo</span><kbd className="rounded bg-bg-surface-hover px-1">⌘Z</kbd></div>
              <div className="flex justify-between"><span>Redo</span><kbd className="rounded bg-bg-surface-hover px-1">⌘⇧Z</kbd></div>
              <div className="flex justify-between"><span>Duplicate</span><kbd className="rounded bg-bg-surface-hover px-1">⌘D</kbd></div>
            </div>
          </div>
        </div>
      )}

      {/* React Flow Canvas */}
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          isValidConnection={isValidConnection}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 2 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#27272A"
          />
          <Controls
            position="bottom-right"
            showInteractive={false}
          />
          <MiniMap
            position="bottom-right"
            style={{ marginBottom: 50 }}
            nodeColor={(node) => {
              const data = node.data as MLNodeData;
              return getNodeColor(data.nodeType);
            }}
            maskColor="rgba(9, 9, 11, 0.7)"
          />

          {/* Top toolbar */}
          <Panel position="top-right">
            <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-surface p-1 shadow-dropdown">
              <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary-hover">
                <Play className="h-3 w-3" />
                Run Pipeline
              </button>
              <div className="mx-0.5 h-5 w-px bg-border-default" />
              <button
                onClick={undo}
                className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
                title="Undo (⌘Z)"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={redo}
                className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
                title="Redo (⌘⇧Z)"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
              <div className="mx-0.5 h-5 w-px bg-border-default" />
              <button
                onClick={deleteSelectedNodes}
                className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
                title="Delete selected"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={duplicateSelectedNodes}
                className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary"
                title="Duplicate (⌘D)"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <div className="mx-0.5 h-5 w-px bg-border-default" />
              <button className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary" title="Save pipeline">
                <Save className="h-3.5 w-3.5" />
              </button>
              <button className="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-bg-surface-hover hover:text-text-secondary" title="Export YAML">
                <FileDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </Panel>

          {/* Validation warnings */}
          {validationErrors.length > 0 && (
            <Panel position="top-left">
              <div className="rounded-lg border border-warning/30 bg-warning/10 p-2 shadow-dropdown max-w-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-3 w-3 text-warning" />
                  <span className="text-[10px] font-medium text-warning">Validation Issues</span>
                </div>
                {validationErrors.map((err, i) => (
                  <div key={i} className="text-[10px] text-text-tertiary ml-4">• {err}</div>
                ))}
              </div>
            </Panel>
          )}

          {/* Node count indicator */}
          <Panel position="bottom-left">
            <div className="flex items-center gap-1.5 rounded-md border border-border-default bg-bg-surface px-2 py-1 text-[10px] text-text-tertiary shadow-dropdown">
              <Layers className="h-3 w-3" />
              {nodes.length} nodes · {edges.length} edges
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Node Config Panel (Right) */}
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onUpdate={updateNodeConfig}
        />
      )}
    </div>
  );
}

// ===== Exported Component (with provider) =====

export function PipelineView() {
  return (
    <ReactFlowProvider>
      <PipelineViewInner />
    </ReactFlowProvider>
  );
}
