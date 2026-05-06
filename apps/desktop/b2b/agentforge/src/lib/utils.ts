import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AgentNodeType, AgentStatus, DeploymentStatus, TestCaseStatus, LogLevel } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCost(usd: number): string {
  if (usd < 0.01) return `$${usd.toFixed(4)}`;
  return `$${usd.toFixed(2)}`;
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getNodeColor(type: AgentNodeType): string {
  const colors: Record<AgentNodeType, string> = {
    llm: '#8B5CF6',
    tool: '#10B981',
    memory: '#F59E0B',
    condition: '#EF4444',
    output: '#06B6D4',
    input: '#94A3B8',
    guardrail: '#F97316',
    custom: '#EC4899',
    transform: '#3B82F6',
  };
  return colors[type];
}

export function getNodeLabel(type: AgentNodeType): string {
  const labels: Record<AgentNodeType, string> = {
    llm: 'LLM',
    tool: 'Tool',
    memory: 'Memory',
    condition: 'Condition',
    output: 'Output',
    input: 'Input',
    guardrail: 'Guardrail',
    custom: 'Custom',
    transform: 'Transform',
  };
  return labels[type];
}

export function getAgentStatusBadge(status: AgentStatus): { color: string; label: string } {
  const badges: Record<AgentStatus, { color: string; label: string }> = {
    draft: { color: 'bg-[#6E7681]/10 text-[#8B949E] border-[#6E7681]/30', label: 'Draft' },
    staging: { color: 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/30', label: 'Staging' },
    deployed: { color: 'bg-[#3FB950]/10 text-[#3FB950] border-[#3FB950]/30', label: 'Deployed' },
    archived: { color: 'bg-[#6E7681]/10 text-[#6E7681] border-[#6E7681]/30', label: 'Archived' },
    error: { color: 'bg-[#F85149]/10 text-[#F85149] border-[#F85149]/30', label: 'Error' },
  };
  return badges[status];
}

export function getDeploymentStatusBadge(status: DeploymentStatus): { color: string; label: string } {
  const badges: Record<DeploymentStatus, { color: string; label: string }> = {
    building: { color: 'bg-info/10 text-info border-info/30', label: 'Building' },
    deploying: { color: 'bg-info/10 text-info border-info/30', label: 'Deploying' },
    active: { color: 'bg-success/10 text-success border-success/30', label: 'Active' },
    stopped: { color: 'bg-[#6E7681]/10 text-[#8B949E] border-[#6E7681]/30', label: 'Stopped' },
    failed: { color: 'bg-error/10 text-error border-error/30', label: 'Failed' },
    rolled_back: { color: 'bg-warning/10 text-warning border-warning/30', label: 'Rolled Back' },
  };
  return badges[status];
}

export function getTestStatusBadge(status: TestCaseStatus): { color: string; label: string } {
  const badges: Record<TestCaseStatus, { color: string; label: string }> = {
    pending: { color: 'bg-[#6E7681]/10 text-[#8B949E]', label: 'Pending' },
    running: { color: 'bg-info/10 text-info', label: 'Running' },
    pass: { color: 'bg-success/10 text-success', label: 'Pass' },
    fail: { color: 'bg-error/10 text-error', label: 'Fail' },
    error: { color: 'bg-error/10 text-error', label: 'Error' },
  };
  return badges[status];
}

export function getLogLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    info: 'text-text-secondary',
    warn: 'text-warning',
    error: 'text-error',
    debug: 'text-text-tertiary',
  };
  return colors[level];
}

export function generateAgentName(): string {
  const adjectives = ['clever', 'swift', 'bright', 'keen', 'sharp', 'bold', 'calm', 'wise', 'agile', 'smart'];
  const nouns = ['agent', 'helper', 'scout', 'guide', 'pilot', 'oracle', 'forge', 'spark', 'nexus', 'core'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}
