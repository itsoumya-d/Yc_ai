import { create } from 'zustand';

export type DocumentCategory = 'will' | 'financial' | 'healthcare' | 'letters' | 'digital' | 'insurance' | 'property';

export interface VaultDocument {
  id: string;
  category: DocumentCategory;
  title: string;
  description: string;
  uploadedAt: string;
  fileSize: string;
  isEncrypted: boolean;
  extractedFields?: Record<string, string>;
  accessLevel: 'all' | 'executor_only' | 'emergency';
}

export interface TrustedPerson {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone?: string;
  avatarInitials: string;
  accessLevel: 'full' | 'executor' | 'emergency_only' | 'specific_docs';
  accessibleCategories?: DocumentCategory[];
  canReceiveOnDeath: boolean;
  addedAt: string;
}

export interface FarewellMessage {
  id: string;
  type: 'letter' | 'video' | 'wish';
  title: string;
  recipient: string;
  preview: string;
  createdAt: string;
  isScheduled: boolean;
  releaseCondition?: string;
}

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface VaultStore {
  documents: VaultDocument[];
  trustedPeople: TrustedPerson[];
  farewellMessages: FarewellMessage[];
  aiConversation: AiMessage[];
  completionPct: number;
  isVaultLocked: boolean;
  addDocument: (doc: Omit<VaultDocument, 'id' | 'uploadedAt'>) => void;
  addTrustedPerson: (person: Omit<TrustedPerson, 'id' | 'addedAt'>) => void;
  sendAiMessage: (message: string) => void;
  lockVault: () => void;
  unlockVault: () => void;
}

const DEMO_DOCUMENTS: VaultDocument[] = [
  {
    id: 'd1', category: 'will', title: 'Last Will & Testament',
    description: 'Signed and notarized — 2025', uploadedAt: '2025-11-12',
    fileSize: '1.2 MB', isEncrypted: true,
    extractedFields: { 'Executor': 'James Mitchell', 'Witnesses': '2 confirmed', 'Last Updated': 'Nov 2025' },
    accessLevel: 'executor_only',
  },
  {
    id: 'd2', category: 'financial', title: 'Bank & Investment Accounts',
    description: 'Account list with instructions', uploadedAt: '2026-01-05',
    fileSize: '0.4 MB', isEncrypted: true,
    extractedFields: { 'Institutions': '3 accounts', 'Total Assets': 'On file' },
    accessLevel: 'executor_only',
  },
  {
    id: 'd3', category: 'healthcare', title: 'Healthcare Directive & DNR',
    description: 'Advance directive — physician signed', uploadedAt: '2025-09-20',
    fileSize: '0.8 MB', isEncrypted: true,
    extractedFields: { 'Healthcare Proxy': 'Sarah Mitchell', 'DNR': 'Yes', 'Organ Donation': 'Yes' },
    accessLevel: 'emergency',
  },
  {
    id: 'd4', category: 'insurance', title: 'Life Insurance Policy',
    description: 'Primary policy — $500K benefit', uploadedAt: '2025-08-14',
    fileSize: '2.1 MB', isEncrypted: true,
    extractedFields: { 'Policy #': 'LF-2024-88432', 'Beneficiary': 'Sarah Mitchell', 'Benefit': '$500,000' },
    accessLevel: 'all',
  },
  {
    id: 'd5', category: 'letters', title: 'Letter to My Children',
    description: 'Personal — to be read after passing', uploadedAt: '2026-02-01',
    fileSize: '0.1 MB', isEncrypted: true, accessLevel: 'all',
  },
  {
    id: 'd6', category: 'digital', title: 'Digital Assets & Passwords',
    description: 'Encrypted list of online accounts', uploadedAt: '2026-01-30',
    fileSize: '0.05 MB', isEncrypted: true,
    extractedFields: { 'Accounts Listed': '12', 'Password Manager': 'Bitwarden' },
    accessLevel: 'executor_only',
  },
];

const DEMO_TRUSTED: TrustedPerson[] = [
  {
    id: 't1', name: 'Sarah Mitchell', relationship: 'Spouse', email: 'sarah.mitchell@email.com',
    avatarInitials: 'SM', accessLevel: 'full', canReceiveOnDeath: true,
    addedAt: '2025-06-01',
  },
  {
    id: 't2', name: 'James Mitchell', relationship: 'Son / Executor', email: 'james.m@email.com',
    phone: '+1 (512) 555-0134', avatarInitials: 'JM', accessLevel: 'executor',
    accessibleCategories: ['will', 'financial', 'insurance', 'property'], canReceiveOnDeath: true,
    addedAt: '2025-06-01',
  },
  {
    id: 't3', name: 'Dr. Patricia Wong', relationship: 'Physician', email: 'dr.wong@citymed.org',
    avatarInitials: 'PW', accessLevel: 'emergency_only',
    accessibleCategories: ['healthcare'], canReceiveOnDeath: false,
    addedAt: '2025-09-15',
  },
];

const DEMO_AI: AiMessage[] = [
  {
    id: 'm1', role: 'assistant', timestamp: '10 min ago',
    content: "Hello! I'm here to help you think through your legacy plan, at whatever pace feels right. Many people find it helpful to start with something specific — like a letter to a loved one, or making sure your important documents are organized. What feels most important to you today?",
  },
];

function computeCompletion(docs: VaultDocument[], trusted: TrustedPerson[]): number {
  const categories: DocumentCategory[] = ['will', 'financial', 'healthcare', 'letters', 'digital', 'insurance'];
  const coveredCategories = new Set(docs.map(d => d.category));
  const categoryScore = (categories.filter(c => coveredCategories.has(c)).length / categories.length) * 60;
  const trustedScore = Math.min(trusted.length / 2, 1) * 25;
  const farewellBonus = 15;
  return Math.round(Math.min(100, categoryScore + trustedScore + farewellBonus));
}

export const useVaultStore = create<VaultStore>((set, get) => ({
  documents: DEMO_DOCUMENTS,
  trustedPeople: DEMO_TRUSTED,
  farewellMessages: [
    {
      id: 'f1', type: 'letter', title: 'Letter to my children',
      recipient: 'James & Emily Mitchell', preview: 'By the time you read this...',
      createdAt: '2026-02-01', isScheduled: true, releaseCondition: 'After passing',
    },
  ],
  aiConversation: DEMO_AI,
  completionPct: computeCompletion(DEMO_DOCUMENTS, DEMO_TRUSTED),
  isVaultLocked: false,

  addDocument: (doc) =>
    set((state) => {
      const newDocs = [...state.documents, { ...doc, id: Date.now().toString(), uploadedAt: new Date().toISOString().split('T')[0] }];
      return { documents: newDocs, completionPct: computeCompletion(newDocs, state.trustedPeople) };
    }),

  addTrustedPerson: (person) =>
    set((state) => {
      const newPeople = [...state.trustedPeople, { ...person, id: Date.now().toString(), addedAt: new Date().toISOString().split('T')[0] }];
      return { trustedPeople: newPeople, completionPct: computeCompletion(state.documents, newPeople) };
    }),

  sendAiMessage: (message) => {
    const userMsg: AiMessage = { id: Date.now().toString(), role: 'user', content: message, timestamp: 'just now' };
    const responses = [
      "That's a meaningful step. Many people find that once they've organized their documents, they feel a profound sense of peace — knowing their loved ones won't face uncertainty during an already difficult time.",
      "I understand. There's no rush with any of this. The act of simply thinking about these things and beginning to organize them is itself a gift to the people you care about.",
      "That's a wonderful thought to capture. Sometimes the most valuable things we leave behind aren't documents or assets — they're the stories, wisdom, and love we've put into words.",
      "You're doing something genuinely meaningful. Would you like to start with your vault documents, or perhaps draft a personal letter that can be shared with your loved ones when the time is right?",
    ];
    const assistantMsg: AiMessage = {
      id: (Date.now() + 1).toString(), role: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: 'just now',
    };
    set((state) => ({ aiConversation: [...state.aiConversation, userMsg, assistantMsg] }));
  },

  lockVault: () => set({ isVaultLocked: true }),
  unlockVault: () => set({ isVaultLocked: false }),
}));
