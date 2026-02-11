export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'won' | 'lost' | 'expired' | 'archived';
export type PricingModel = 'fixed' | 'time_materials' | 'retainer' | 'value_based' | 'milestone';
export type ContentBlockType = 'case_study' | 'team_bio' | 'methodology' | 'terms' | 'about' | 'faq';
export type SectionType = 'executive_summary' | 'scope' | 'timeline' | 'pricing' | 'team' | 'case_studies' | 'terms' | 'custom';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  industry: string | null;
  category: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  template_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  user_id: string;
  client_id: string | null;
  template_id: string | null;
  title: string;
  status: ProposalStatus;
  value: number;
  currency: string;
  pricing_model: PricingModel;
  valid_until: string | null;
  notes: string | null;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalSection {
  id: string;
  proposal_id: string;
  title: string;
  content: string;
  order_index: number;
  section_type: SectionType;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  id: string;
  user_id: string;
  title: string;
  content: string;
  block_type: ContentBlockType;
  created_at: string;
  updated_at: string;
}

export interface AIGeneration {
  id: string;
  user_id: string;
  proposal_id: string | null;
  prompt: string;
  result: string;
  tokens_used: number;
  model: string;
  created_at: string;
}

export interface ProposalWithClient extends Proposal {
  clients?: { name: string; company: string | null } | null;
}

export interface ProposalWithDetails extends Proposal {
  clients?: { name: string; company: string | null } | null;
  proposal_sections: ProposalSection[];
}
