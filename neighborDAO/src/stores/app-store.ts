'use client';

import { create } from 'zustand';
import type { Proposal, Member, Transaction, DAOStats, Comment } from '@/types';

const SAMPLE_PROPOSALS: Proposal[] = [
  {
    id: 'p1', title: 'Install LED Street Lighting on Oak Avenue', type: 'funding', status: 'active',
    description: 'Proposal to replace 24 aging sodium streetlights with energy-efficient LED units, reducing energy costs by 40% and improving safety.',
    author: 'Maria Chen', author_id: 'm1', created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    votes_for: 42, votes_against: 8, votes_abstain: 3, budget: 12500, discussion_count: 14,
  },
  {
    id: 'p2', title: 'Establish Community Garden on Pine Street Lot', type: 'general', status: 'active',
    description: 'Convert the vacant lot at 234 Pine Street into a shared community garden with raised beds available for resident rental.',
    author: 'James Torres', author_id: 'm2', created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    votes_for: 67, votes_against: 12, votes_abstain: 7, budget: 8000, discussion_count: 28,
  },
  {
    id: 'p3', title: 'Amend Noise Ordinance to Allow Events Until 11pm on Weekends', type: 'rule_change', status: 'passed',
    description: 'Update Section 4.2 of community bylaws to extend the allowed noise hours from 10pm to 11pm on Fridays and Saturdays.',
    author: 'Sarah Wilson', author_id: 'm3', created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    deadline: new Date(Date.now() - 5 * 86400000).toISOString(),
    votes_for: 89, votes_against: 34, votes_abstain: 11, discussion_count: 52,
  },
  {
    id: 'p4', title: 'Elect Block Captain for Elm Street Sector', type: 'election', status: 'active',
    description: 'Annual election for the Elm Street Sector block captain position. Candidates: David Park, Emma Johnson.',
    author: 'Tom Kim', author_id: 'm4', created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    votes_for: 28, votes_against: 21, votes_abstain: 5, discussion_count: 9,
  },
  {
    id: 'p5', title: 'Purchase Snow Removal Equipment for Community Use', type: 'funding', status: 'failed',
    description: 'Pool funds to purchase a commercial snow blower and salt spreader for community shared use during winter months.',
    author: 'Lisa Park', author_id: 'm5', created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    deadline: new Date(Date.now() - 10 * 86400000).toISOString(),
    votes_for: 23, votes_against: 48, votes_abstain: 8, budget: 3200, discussion_count: 31,
  },
];

const SAMPLE_MEMBERS: Member[] = [
  { id: 'm1', name: 'Maria Chen', email: 'maria@maplegrove.community', role: 'admin', voting_power: 3, joined_at: '2023-01-15T00:00:00Z', proposals_created: 8, votes_cast: 42 },
  { id: 'm2', name: 'James Torres', email: 'james@maplegrove.community', role: 'moderator', voting_power: 2, joined_at: '2023-03-22T00:00:00Z', proposals_created: 5, votes_cast: 38 },
  { id: 'm3', name: 'Sarah Wilson', email: 'sarah@maplegrove.community', role: 'member', voting_power: 1, joined_at: '2023-05-10T00:00:00Z', proposals_created: 4, votes_cast: 35 },
  { id: 'm4', name: 'Tom Kim', email: 'tom@maplegrove.community', role: 'member', voting_power: 1, joined_at: '2023-07-01T00:00:00Z', proposals_created: 2, votes_cast: 28 },
  { id: 'm5', name: 'Lisa Park', email: 'lisa@maplegrove.community', role: 'member', voting_power: 1, joined_at: '2023-08-14T00:00:00Z', proposals_created: 3, votes_cast: 22 },
  { id: 'm6', name: 'David Martinez', email: 'david@maplegrove.community', role: 'member', voting_power: 1, joined_at: '2023-10-05T00:00:00Z', proposals_created: 1, votes_cast: 15 },
  { id: 'm7', name: 'Emma Johnson', email: 'emma@maplegrove.community', role: 'member', voting_power: 1, joined_at: '2024-01-20T00:00:00Z', proposals_created: 0, votes_cast: 12 },
  { id: 'm8', name: 'Robert Chang', email: 'robert@maplegrove.community', role: 'member', voting_power: 1, joined_at: '2024-02-10T00:00:00Z', proposals_created: 0, votes_cast: 8 },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Monthly member dues (March)', amount: 2400, type: 'income', date: '2025-03-01T00:00:00Z', category: 'Dues', approved_by: 'Maria Chen' },
  { id: 't2', description: 'Park maintenance - Q1', amount: 850, type: 'expense', date: '2025-02-28T00:00:00Z', category: 'Maintenance', approved_by: 'Maria Chen' },
  { id: 't3', description: 'Annual insurance payment', amount: 1200, type: 'expense', date: '2025-02-15T00:00:00Z', category: 'Insurance', approved_by: 'James Torres' },
  { id: 't4', description: 'Event sponsorship - Winter Fest', amount: 500, type: 'income', date: '2025-02-10T00:00:00Z', category: 'Events', approved_by: 'Maria Chen' },
  { id: 't5', description: 'LED lighting pilot - Oak Ave (Phase 1)', amount: 4200, type: 'expense', date: '2025-01-30T00:00:00Z', category: 'Infrastructure', approved_by: 'James Torres' },
  { id: 't6', description: 'Monthly member dues (February)', amount: 2300, type: 'income', date: '2025-02-01T00:00:00Z', category: 'Dues', approved_by: 'Maria Chen' },
  { id: 't7', description: 'Community garden seed fund', amount: 320, type: 'expense', date: '2025-01-20T00:00:00Z', category: 'Community', approved_by: 'Sarah Wilson' },
  { id: 't8', description: 'Newsletter printing & distribution', amount: 180, type: 'expense', date: '2025-01-10T00:00:00Z', category: 'Communications', approved_by: 'Tom Kim' },
];

const SAMPLE_COMMENTS: Comment[] = [
  { id: 'c1', proposal_id: 'p1', author: 'James Torres', author_id: 'm2', content: 'This would significantly reduce our carbon footprint and maintenance costs. Strong yes from me.', created_at: new Date(Date.now() - 4 * 86400000).toISOString(), likes: 5 },
  { id: 'c2', proposal_id: 'p1', author: 'Sarah Wilson', author_id: 'm3', content: 'What is the expected ROI timeline? Can we get a breakdown of the installation cost vs. energy savings?', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), likes: 3 },
  { id: 'c3', proposal_id: 'p2', author: 'Tom Kim', author_id: 'm4', content: 'Love this idea! My kids would definitely participate. Is there a plan for water access?', created_at: new Date(Date.now() - 7 * 86400000).toISOString(), likes: 8 },
];

interface AppState {
  proposals: Proposal[];
  members: Member[];
  transactions: Transaction[];
  comments: Comment[];
  currentUser: Member | null;
  stats: DAOStats;
  setCurrentUser: (user: Member | null) => void;
  addProposal: (p: Proposal) => void;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  voteOnProposal: (id: string, vote: 'for' | 'against' | 'abstain') => void;
  addTransaction: (t: Transaction) => void;
  addComment: (c: Comment) => void;
}

export const useAppStore = create<AppState>((set) => ({
  proposals: SAMPLE_PROPOSALS,
  members: SAMPLE_MEMBERS,
  transactions: SAMPLE_TRANSACTIONS,
  comments: SAMPLE_COMMENTS,
  currentUser: SAMPLE_MEMBERS[0],
  stats: {
    name: 'Maple Grove DAO',
    treasury_balance: 28450,
    total_members: 8,
    active_proposals: 3,
    total_proposals: 5,
    voting_participation: 78,
    monthly_income: 2900,
    monthly_expenses: 6750,
  },
  setCurrentUser: (user) => set({ currentUser: user }),
  addProposal: (p) => set((s) => ({ proposals: [p, ...s.proposals] })),
  updateProposal: (id, updates) => set((s) => ({
    proposals: s.proposals.map((p) => p.id === id ? { ...p, ...updates } : p),
  })),
  voteOnProposal: (id, vote) => set((s) => ({
    proposals: s.proposals.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        votes_for: vote === 'for' ? p.votes_for + 1 : p.votes_for,
        votes_against: vote === 'against' ? p.votes_against + 1 : p.votes_against,
        votes_abstain: vote === 'abstain' ? p.votes_abstain + 1 : p.votes_abstain,
      };
    }),
  })),
  addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
  addComment: (c) => set((s) => ({
    comments: [...s.comments, c],
    proposals: s.proposals.map((p) =>
      p.id === c.proposal_id ? { ...p, discussion_count: p.discussion_count + 1 } : p
    ),
  })),
}));
