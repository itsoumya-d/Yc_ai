'use client';
import { create } from 'zustand';
import type { Deal, Activity, Rep, ForecastEntry } from '@/types';

const DEALS: Deal[] = [
  { id: 'd1', name: 'Enterprise Platform License', company: 'Accenture', value: 185000, stage: 'negotiation', health: 'healthy', ai_score: 84, close_date: '2025-03-15T00:00:00Z', owner: 'Sarah Kim', owner_id: 'r1', last_activity: '2025-01-24T10:00:00Z', days_in_stage: 8, contacts: 4, next_action: 'Send revised MSA to legal team', ai_insight: 'Champion confirmed budget. Legal review is the only remaining gate. Multi-threaded (4 contacts). High confidence close.' },
  { id: 'd2', name: 'Data Analytics Suite', company: 'Goldman Sachs', value: 240000, stage: 'proposal', health: 'at_risk', ai_score: 61, close_date: '2025-02-28T00:00:00Z', owner: 'Marcus Webb', owner_id: 'r2', last_activity: '2025-01-18T10:00:00Z', days_in_stage: 19, contacts: 2, next_action: 'Re-engage CFO — last contact was 6 days ago', ai_insight: 'Engagement dropping. Only 2 contacts engaged, CFO has gone cold. Risk: competitor may be advancing. Recommend multi-threading immediately.' },
  { id: 'd3', name: 'Security Platform', company: 'JPMorgan Chase', value: 320000, stage: 'qualified', health: 'healthy', ai_score: 71, close_date: '2025-04-30T00:00:00Z', owner: 'Sarah Kim', owner_id: 'r1', last_activity: '2025-01-25T10:00:00Z', days_in_stage: 5, contacts: 3, next_action: 'Schedule technical POC with engineering team', ai_insight: 'Strong buying signals. CISO attended 3 calls. Procurement already contacted legal. Likely to progress to proposal within 2 weeks.' },
  { id: 'd4', name: 'CRM Integration Package', company: 'Spotify', value: 65000, stage: 'proposal', health: 'stalled', ai_score: 38, close_date: '2025-02-15T00:00:00Z', owner: 'Tom Park', owner_id: 'r3', last_activity: '2025-01-10T10:00:00Z', days_in_stage: 31, contacts: 1, next_action: 'Break stall — try exec-to-exec outreach', ai_insight: 'No engagement in 15 days. Single-threaded (1 contact). Close date is in 3 weeks with no movement. Recommend escalation or close-lost.' },
  { id: 'd5', name: 'AI Ops Platform', company: 'Microsoft', value: 480000, stage: 'negotiation', health: 'healthy', ai_score: 92, close_date: '2025-02-20T00:00:00Z', owner: 'Rachel Torres', owner_id: 'r4', last_activity: '2025-01-25T10:00:00Z', days_in_stage: 4, contacts: 6, next_action: 'Finalize pricing addendum with procurement', ai_insight: 'Highest-confidence deal in pipeline. 6 stakeholders engaged. Budget confirmed. Procurement moving final paperwork. Likely to close this week.' },
  { id: 'd6', name: 'Compliance Reporting Tool', company: 'Deloitte', value: 95000, stage: 'qualified', health: 'at_risk', ai_score: 55, close_date: '2025-03-31T00:00:00Z', owner: 'Marcus Webb', owner_id: 'r2', last_activity: '2025-01-22T10:00:00Z', days_in_stage: 12, contacts: 2, next_action: 'Identify economic buyer — currently talking to IT only', ai_insight: 'No economic buyer identified. IT team engaged but no budget authority. Engagement frequency slowing. Need executive sponsor to progress.' },
  { id: 'd7', name: 'DevOps Toolchain', company: 'Stripe', value: 130000, stage: 'closed_won', health: 'healthy', ai_score: 100, close_date: '2025-01-20T00:00:00Z', owner: 'Rachel Torres', owner_id: 'r4', last_activity: '2025-01-20T10:00:00Z', days_in_stage: 0, contacts: 5, next_action: '', ai_insight: '' },
  { id: 'd8', name: 'Data Warehouse Migration', company: 'Netflix', value: 210000, stage: 'closed_lost', health: 'critical', ai_score: 0, close_date: '2025-01-15T00:00:00Z', owner: 'Tom Park', owner_id: 'r3', last_activity: '2025-01-15T10:00:00Z', days_in_stage: 0, contacts: 2, next_action: '', ai_insight: '' },
];

const ACTIVITIES: Activity[] = [
  { id: 'a1', deal_id: 'd1', type: 'meeting', summary: 'Quarterly business review with Accenture C-suite. Strong alignment on pricing. Legal review kick-off scheduled.', created_at: '2025-01-24T14:00:00Z', author: 'Sarah Kim' },
  { id: 'a2', deal_id: 'd1', type: 'email', summary: 'Sent revised proposal with updated SLA terms to procurement lead.', created_at: '2025-01-22T09:30:00Z', author: 'Sarah Kim' },
  { id: 'a3', deal_id: 'd2', type: 'call', summary: '30-min discovery call with VP Engineering. Positive technical fit confirmed.', created_at: '2025-01-18T11:00:00Z', author: 'Marcus Webb' },
  { id: 'a4', deal_id: 'd5', type: 'stage_change', summary: 'Deal moved from Proposal to Negotiation. MSA redlines received from legal.', created_at: '2025-01-21T16:00:00Z', author: 'Rachel Torres' },
  { id: 'a5', deal_id: 'd5', type: 'email', summary: 'Procurement sent final pricing addendum. Final sign-off pending CFO approval.', created_at: '2025-01-25T08:00:00Z', author: 'Rachel Torres' },
];

const REPS: Rep[] = [
  { id: 'r1', name: 'Sarah Kim', avatar_initial: 'S', deals_open: 12, pipeline_value: 1240000, quota: 500000, attainment: 118, won_ytd: 590000, avg_deal_size: 142000, win_rate: 64 },
  { id: 'r2', name: 'Marcus Webb', avatar_initial: 'M', deals_open: 9, pipeline_value: 860000, quota: 450000, attainment: 91, won_ytd: 410000, avg_deal_size: 118000, win_rate: 52 },
  { id: 'r3', name: 'Tom Park', avatar_initial: 'T', deals_open: 7, pipeline_value: 520000, quota: 400000, attainment: 68, won_ytd: 272000, avg_deal_size: 94000, win_rate: 41 },
  { id: 'r4', name: 'Rachel Torres', avatar_initial: 'R', deals_open: 11, pipeline_value: 1480000, quota: 550000, attainment: 126, won_ytd: 693000, avg_deal_size: 168000, win_rate: 71 },
];

const FORECAST: ForecastEntry[] = [
  { period: 'Q1 2025', committed: 1450000, best_case: 1980000, won: 390000, quota: 1800000 },
  { period: 'Q4 2024', committed: 0, best_case: 0, won: 1640000, quota: 1600000 },
  { period: 'Q3 2024', committed: 0, best_case: 0, won: 1420000, quota: 1500000 },
];

interface AppState {
  deals: Deal[];
  activities: Activity[];
  reps: Rep[];
  forecast: ForecastEntry[];
  selectedDealId: string | null;
  updateDealStage: (id: string, stage: Deal['stage']) => void;
  selectDeal: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  deals: DEALS,
  activities: ACTIVITIES,
  reps: REPS,
  forecast: FORECAST,
  selectedDealId: null,
  updateDealStage: (id, stage) => set((s) => ({ deals: s.deals.map((d) => d.id === id ? { ...d, stage } : d) })),
  selectDeal: (id) => set({ selectedDealId: id }),
}));
