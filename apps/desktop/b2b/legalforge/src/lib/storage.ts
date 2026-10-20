import type {
  Contract, ContractTemplate, Clause, RiskFinding, Obligation,
  ContractStatus, ContractType, RiskLevel, ClauseCategory,
  ObligationType, ObligationUrgency,
} from '@/types/database';

// ---- Settings ----

export interface LegalForgeSettings {
  openaiApiKey: string;
  docusignApiKey: string;
  theme: 'dark' | 'light' | 'system';
  editorFontSize: number;
  contractFont: string;
}

const DEFAULT_SETTINGS: LegalForgeSettings = {
  openaiApiKey: '',
  docusignApiKey: '',
  theme: 'dark',
  editorFontSize: 14,
  contractFont: 'Source Serif 4',
};

export function getSettings(): LegalForgeSettings {
  try {
    const raw = localStorage.getItem('legalforge-settings');
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(partial: Partial<LegalForgeSettings>) {
  const current = getSettings();
  const merged = { ...current, ...partial };
  localStorage.setItem('legalforge-settings', JSON.stringify(merged));
}

// ---- Contracts ----

export function getContracts(): Contract[] {
  try {
    const raw = localStorage.getItem('legalforge-contracts');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveContract(contract: Contract) {
  const all = getContracts();
  const idx = all.findIndex((c) => c.id === contract.id);
  if (idx >= 0) {
    all[idx] = contract;
  } else {
    all.push(contract);
  }
  localStorage.setItem('legalforge-contracts', JSON.stringify(all));
}

export function deleteContract(id: string) {
  const all = getContracts().filter((c) => c.id !== id);
  localStorage.setItem('legalforge-contracts', JSON.stringify(all));
}

// ---- Contract Content (body text) ----

export function getContractContent(contractId: string): string {
  try {
    return localStorage.getItem(`legalforge-content-${contractId}`) || '';
  } catch {
    return '';
  }
}

export function saveContractContent(contractId: string, content: string) {
  localStorage.setItem(`legalforge-content-${contractId}`, content);
}

// ---- Risk Findings ----

export function getRiskFindings(contractId: string): RiskFinding[] {
  try {
    const raw = localStorage.getItem(`legalforge-risks-${contractId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRiskFindings(contractId: string, findings: RiskFinding[]) {
  localStorage.setItem(`legalforge-risks-${contractId}`, JSON.stringify(findings));
}

export function resolveRiskFinding(contractId: string, findingId: string) {
  const all = getRiskFindings(contractId);
  const idx = all.findIndex((f) => f.id === findingId);
  if (idx >= 0) {
    const item = all[idx]!;
    item.resolved = true;
    localStorage.setItem(`legalforge-risks-${contractId}`, JSON.stringify(all));
  }
}

// ---- Clauses Library ----

export function getClauses(): Clause[] {
  try {
    const raw = localStorage.getItem('legalforge-clauses');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveClause(clause: Clause) {
  const all = getClauses();
  const idx = all.findIndex((c) => c.id === clause.id);
  if (idx >= 0) {
    all[idx] = clause;
  } else {
    all.push(clause);
  }
  localStorage.setItem('legalforge-clauses', JSON.stringify(all));
}

export function deleteClause(id: string) {
  const all = getClauses().filter((c) => c.id !== id);
  localStorage.setItem('legalforge-clauses', JSON.stringify(all));
}

// ---- Obligations ----

export function getObligations(): Obligation[] {
  try {
    const raw = localStorage.getItem('legalforge-obligations');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveObligation(obligation: Obligation) {
  const all = getObligations();
  const idx = all.findIndex((o) => o.id === obligation.id);
  if (idx >= 0) {
    all[idx] = obligation;
  } else {
    all.push(obligation);
  }
  localStorage.setItem('legalforge-obligations', JSON.stringify(all));
}

export function toggleObligationComplete(id: string) {
  const all = getObligations();
  const idx = all.findIndex((o) => o.id === id);
  if (idx >= 0) {
    const item = all[idx]!;
    item.completed = !item.completed;
    localStorage.setItem('legalforge-obligations', JSON.stringify(all));
    return item.completed;
  }
  return false;
}

// ---- Chat History ----

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function getChatHistory(contractId: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(`legalforge-chat-${contractId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChatMessage(contractId: string, message: ChatMessage) {
  const all = getChatHistory(contractId);
  all.push(message);
  localStorage.setItem(`legalforge-chat-${contractId}`, JSON.stringify(all));
}

// ---- Helpers ----

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---- Dashboard Stats ----

export function getDashboardStats() {
  const contracts = getContracts();
  const obligations = getObligations();

  let active = 0;
  let pendingReview = 0;
  let executed = 0;
  let totalRisk = 0;

  for (const c of contracts) {
    if (c.status !== 'executed' && c.status !== 'expired' && c.status !== 'archived') {
      active++;
    }
    if (c.status === 'in_review') {
      pendingReview++;
    }
    if (c.status === 'executed') {
      executed++;
    }
    totalRisk += (c.risk_score || 0);
  }

  const avgRisk = contracts.length > 0 ? Math.round(totalRisk / contracts.length) : 0;

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  let dueThisWeek = 0;
  let overdue = 0;

  for (const o of obligations) {
    if (!o.completed) {
      const d = new Date(o.due_date);
      if (d >= now && d <= weekEnd) {
        dueThisWeek++;
      }
      if (d < now) {
        overdue++;
      }
    }
  }

  return { active, pendingReview, executed, avgRisk, dueThisWeek, overdue, total: contracts.length };
}
