import { cn, getTestStatusBadge, formatLatency, formatTokens, formatCost } from '@/lib/utils';
import type { TestCaseStatus } from '@/types/database';
import {
  TestTubes,
  Play,
  Plus,
  Square,
  BarChart3,
  Check,
  X,
  Clock,
  Zap,
  DollarSign,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';

interface DemoTestCase {
  id: string;
  name: string;
  input: string;
  status: TestCaseStatus;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  evaluationScore: number;
  nodesExecuted: number;
  totalNodes: number;
}

const demoTestCases: DemoTestCase[] = [
  { id: 'tc1', name: 'Refund query', input: 'I want a refund for order ORD-789', status: 'pass', latencyMs: 1200, inputTokens: 342, outputTokens: 256, cost: 0.0045, evaluationScore: 4.5, nodesExecuted: 5, totalNodes: 5 },
  { id: 'tc2', name: 'Order status', input: 'Where is my order ORD-456?', status: 'pass', latencyMs: 980, inputTokens: 310, outputTokens: 180, cost: 0.0035, evaluationScore: 4.8, nodesExecuted: 5, totalNodes: 5 },
  { id: 'tc3', name: 'Complex return', input: 'I bought 3 items and want to return 2, they arrived damaged', status: 'fail', latencyMs: 3200, inputTokens: 520, outputTokens: 410, cost: 0.0082, evaluationScore: 2.1, nodesExecuted: 4, totalNodes: 5 },
  { id: 'tc4', name: 'Product info', input: 'What is the difference between Plan A and Plan B?', status: 'pass', latencyMs: 850, inputTokens: 280, outputTokens: 320, cost: 0.0042, evaluationScore: 4.2, nodesExecuted: 5, totalNodes: 5 },
  { id: 'tc5', name: 'Billing issue', input: 'I was charged twice for my subscription', status: 'pending', latencyMs: 0, inputTokens: 0, outputTokens: 0, cost: 0, evaluationScore: 0, nodesExecuted: 0, totalNodes: 5 },
];

const demoConversation = [
  { role: 'user', content: 'I need help with my order ORD-789', time: '14:32:01' },
  { role: 'tool_call', content: 'order_lookup', detail: '{"id": "ORD-789"}', time: '14:32:01' },
  { role: 'tool_result', content: 'Result', detail: '{"status": "shipped", "tracking": "TRK-123", "eta": "Feb 12"}', time: '14:32:02' },
  { role: 'assistant', content: 'Your order ORD-789 has been shipped! You can track it with tracking number TRK-123. Estimated delivery is February 12th.', time: '14:32:02' },
];

const evaluations = [
  { name: 'Accuracy', result: 'PASS', score: 95 },
  { name: 'Relevance', result: 'PASS', score: 88 },
  { name: 'Safety', result: 'PASS', score: 100 },
  { name: 'Latency', result: 'PASS', score: 0 },
];

export function TestRunnerView() {
  const [selectedTest, setSelectedTest] = useState('tc1');
  const passCount = demoTestCases.filter((t) => t.status === 'pass').length;
  const failCount = demoTestCases.filter((t) => t.status === 'fail').length;
  const selected = demoTestCases.find((t) => t.id === selectedTest);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <TestTubes className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-text-primary">Test Runner</h2>
          <span className="rounded bg-bg-surface-hover px-2 py-0.5 text-[10px] text-text-tertiary">
            Customer Support Bot
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-border-default px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:bg-bg-surface-hover">
            <Plus className="h-3 w-3" />
            Add Test
          </button>
          <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-text-on-color transition-colors hover:bg-primary-active">
            <Play className="h-3 w-3" />
            Run All
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Test Cases Panel */}
        <div className="flex w-56 flex-col border-r border-border-default bg-bg-surface">
          <div className="border-b border-border-subtle px-3 py-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-success">{passCount} passed</span>
              <span className="text-text-tertiary">/</span>
              <span className="text-error">{failCount} failed</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {demoTestCases.map((tc) => {
              const badge = getTestStatusBadge(tc.status);
              return (
                <button
                  key={tc.id}
                  onClick={() => setSelectedTest(tc.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 border-b border-border-subtle px-3 py-2.5 text-left transition-colors',
                    selectedTest === tc.id ? 'bg-bg-surface-hover' : 'hover:bg-bg-surface-hover/50'
                  )}
                >
                  {tc.status === 'pass' && <Check className="h-3.5 w-3.5 flex-shrink-0 text-success" />}
                  {tc.status === 'fail' && <X className="h-3.5 w-3.5 flex-shrink-0 text-error" />}
                  {tc.status === 'pending' && <Clock className="h-3.5 w-3.5 flex-shrink-0 text-text-tertiary" />}
                  {tc.status === 'running' && <div className="h-3.5 w-3.5 flex-shrink-0 animate-spin rounded-full border-2 border-info border-t-transparent" />}
                  {tc.status === 'error' && <X className="h-3.5 w-3.5 flex-shrink-0 text-error" />}
                  <div>
                    <div className="text-xs font-medium text-text-primary">{tc.name}</div>
                    <div className="text-[10px] text-text-tertiary">{tc.id}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Viewer */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {demoConversation.map((msg, i) => (
              <div key={i} className="space-y-1">
                {msg.role === 'user' && (
                  <div className="flex gap-2">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-text-tertiary" />
                    <div>
                      <div className="mb-0.5 text-[10px] text-text-tertiary">User ({msg.time})</div>
                      <div className="rounded-lg border border-border-default bg-bg-surface-raised p-3 text-xs text-text-primary">{msg.content}</div>
                    </div>
                  </div>
                )}
                {msg.role === 'tool_call' && (
                  <div className="flex gap-2">
                    <Wrench className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-node-tool" />
                    <div className="flex-1">
                      <div className="mb-0.5 text-[10px] text-text-tertiary">Tool Call: {msg.content} ({msg.time})</div>
                      <pre className="rounded-lg border border-node-tool/20 bg-node-tool/5 p-2 font-mono text-[11px] text-text-primary">{msg.detail}</pre>
                    </div>
                  </div>
                )}
                {msg.role === 'tool_result' && (
                  <div className="flex gap-2">
                    <Wrench className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-node-tool" />
                    <div className="flex-1">
                      <div className="mb-0.5 text-[10px] text-text-tertiary">{msg.content} ({msg.time})</div>
                      <pre className="rounded-lg border border-border-subtle bg-bg-surface p-2 font-mono text-[11px] text-text-primary">{msg.detail}</pre>
                    </div>
                  </div>
                )}
                {msg.role === 'assistant' && (
                  <div className="flex gap-2">
                    <Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    <div>
                      <div className="mb-0.5 text-[10px] text-text-tertiary">Assistant ({msg.time})</div>
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-text-primary">{msg.content}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Evaluation Results */}
            <div className="rounded-lg border border-border-default bg-bg-surface p-3">
              <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">Evaluation</div>
              <div className="space-y-1.5">
                {evaluations.map((ev) => (
                  <div key={ev.name} className="flex items-center justify-between text-xs">
                    <span className="text-text-secondary">{ev.name}</span>
                    <span className={cn('font-medium', ev.result === 'PASS' ? 'text-success' : 'text-error')}>
                      {ev.result} {ev.score > 0 && `(${ev.score}%)`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        {selected && (
          <div className="flex w-48 flex-col border-l border-border-default bg-bg-surface p-3 space-y-4">
            <div>
              <div className="text-[10px] text-text-tertiary">Latency</div>
              <div className="font-mono text-lg font-semibold text-text-primary">{formatLatency(selected.latencyMs)}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">Tokens</div>
              <div className="space-y-0.5 font-mono text-xs">
                <div className="flex justify-between"><span className="text-text-tertiary">Input</span><span className="text-text-primary">{selected.inputTokens}</span></div>
                <div className="flex justify-between"><span className="text-text-tertiary">Output</span><span className="text-text-primary">{selected.outputTokens}</span></div>
                <div className="flex justify-between border-t border-border-subtle pt-0.5"><span className="text-text-secondary">Total</span><span className="text-text-primary">{selected.inputTokens + selected.outputTokens}</span></div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">Cost</div>
              <div className="font-mono text-sm text-text-primary">{formatCost(selected.cost)}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">Nodes Executed</div>
              <div className="font-mono text-sm text-text-primary">{selected.nodesExecuted} / {selected.totalNodes}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">Evaluation Score</div>
              <div className="font-mono text-sm text-text-primary">{selected.evaluationScore.toFixed(1)} / 5.0</div>
            </div>
            <div>
              <div className="text-[10px] text-text-tertiary">Status</div>
              <div className={cn('text-sm font-medium', selected.status === 'pass' ? 'text-success' : selected.status === 'fail' ? 'text-error' : 'text-text-tertiary')}>
                {selected.status.toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
