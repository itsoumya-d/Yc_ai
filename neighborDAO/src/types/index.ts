export type ProposalStatus = 'draft' | 'active' | 'passed' | 'failed' | 'pending';
export type ProposalType = 'funding' | 'rule_change' | 'election' | 'general';
export type MemberRole = 'admin' | 'moderator' | 'member';
export type TransactionType = 'income' | 'expense';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  type: ProposalType;
  status: ProposalStatus;
  author: string;
  author_id: string;
  created_at: string;
  deadline: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  budget?: number;
  discussion_count: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  voting_power: number;
  joined_at: string;
  proposals_created: number;
  votes_cast: number;
  avatar?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string;
  approved_by: string;
}

export interface Comment {
  id: string;
  proposal_id: string;
  author: string;
  author_id: string;
  content: string;
  created_at: string;
  likes: number;
}

export interface DAOStats {
  name: string;
  treasury_balance: number;
  total_members: number;
  active_proposals: number;
  total_proposals: number;
  voting_participation: number;
  monthly_income: number;
  monthly_expenses: number;
}
