import { create } from 'zustand';

export type SkinConcern = 'dryness' | 'oiliness' | 'acne' | 'redness' | 'pigmentation' | 'sensitivity' | 'aging' | 'texture';
export type SeverityLevel = 'none' | 'mild' | 'moderate' | 'significant';
export type TrendDirection = 'improving' | 'stable' | 'worsening';

export interface SkinMetric {
  label: string;
  score: number; // 0-100, higher is better
  trend: TrendDirection;
  note: string;
}

export interface SkinCheckIn {
  id: string;
  date: string;
  overallScore: number;
  metrics: SkinMetric[];
  concerns: SkinConcern[];
  aiSummary: string;
  recommendations: string[];
  photoUri?: string;
  lifestyle?: {
    sleep: number; // hours
    hydration: number; // glasses of water
    stress: number; // 1-5
  };
}

export interface Product {
  id: string;
  name: string;
  type: string;
  morningUse: boolean;
  eveningUse: boolean;
  startDate: string;
}

export interface AuraStore {
  checkIns: SkinCheckIn[];
  products: Product[];
  streak: number;
  hasOnboarded: boolean;
  skinType: string;
  concerns: SkinConcern[];
  addCheckIn: (checkIn: SkinCheckIn) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  setOnboarded: (val: boolean) => void;
}

const DEMO_CHECK_INS: SkinCheckIn[] = [
  {
    id: '1',
    date: 'Jan 25',
    overallScore: 68,
    metrics: [
      { label: 'Hydration', score: 62, trend: 'improving', note: 'Slight dryness on cheeks' },
      { label: 'Clarity', score: 72, trend: 'stable', note: 'Minor breakouts around jawline' },
      { label: 'Texture', score: 65, trend: 'improving', note: 'Improved smoothness noted' },
      { label: 'Tone', score: 70, trend: 'stable', note: 'Even tone overall' },
    ],
    concerns: ['dryness', 'acne'],
    aiSummary: 'Your skin is showing early signs of dehydration and mild congestion. Hydration levels have improved from your last check-in. We recommend seeing a dermatologist to evaluate the recurring breakouts.',
    recommendations: [
      'Increase daily water intake to 8+ glasses',
      'Consider a hyaluronic acid serum for hydration',
      'Avoid touching your face during the day',
    ],
    lifestyle: { sleep: 6.5, hydration: 5, stress: 3 },
  },
  {
    id: '2',
    date: 'Feb 1',
    overallScore: 74,
    metrics: [
      { label: 'Hydration', score: 71, trend: 'improving', note: 'Improved hydration levels' },
      { label: 'Clarity', score: 76, trend: 'improving', note: 'Breakouts clearing up' },
      { label: 'Texture', score: 72, trend: 'improving', note: 'Smoother texture overall' },
      { label: 'Tone', score: 76, trend: 'stable', note: 'Consistent even tone' },
    ],
    concerns: ['dryness'],
    aiSummary: 'Noticeable improvement since your last check-in. Clarity is trending up and hydration is recovering. Keep up the current routine. We recommend a dermatologist visit for a professional assessment.',
    recommendations: [
      'Maintain your current hydration routine',
      'Add SPF 30+ sunscreen if not already using one',
      'Schedule a professional skin assessment',
    ],
    lifestyle: { sleep: 7.5, hydration: 8, stress: 2 },
  },
  {
    id: '3',
    date: 'Feb 8',
    overallScore: 81,
    metrics: [
      { label: 'Hydration', score: 82, trend: 'improving', note: 'Well hydrated' },
      { label: 'Clarity', score: 84, trend: 'improving', note: 'Clear and calm skin' },
      { label: 'Texture', score: 78, trend: 'improving', note: 'Visibly smoother' },
      { label: 'Tone', score: 80, trend: 'stable', note: 'Bright and even' },
    ],
    concerns: [],
    aiSummary: 'Excellent progress over the past 2 weeks. Your skin health score has improved by 13 points. Continued improvement in hydration and clarity. Always consult a dermatologist for any persistent concerns.',
    recommendations: [
      'Your routine is working — keep it consistent',
      'Introduce a gentle exfoliant 1-2x per week',
      'Continue tracking to maintain progress',
    ],
    lifestyle: { sleep: 8, hydration: 9, stress: 1 },
  },
];

const DEMO_PRODUCTS: Product[] = [
  { id: '1', name: 'Cetaphil Gentle Cleanser', type: 'Cleanser', morningUse: true, eveningUse: true, startDate: 'Jan 15' },
  { id: '2', name: 'The Ordinary Hyaluronic Acid', type: 'Serum', morningUse: true, eveningUse: false, startDate: 'Jan 20' },
  { id: '3', name: 'CeraVe Daily Moisturizer SPF 30', type: 'Moisturizer + SPF', morningUse: true, eveningUse: false, startDate: 'Jan 15' },
];

export const useAuraStore = create<AuraStore>(set => ({
  checkIns: DEMO_CHECK_INS,
  products: DEMO_PRODUCTS,
  streak: 14,
  hasOnboarded: true,
  skinType: 'Combination',
  concerns: ['dryness', 'acne'],
  addCheckIn: checkIn => set(state => ({ checkIns: [checkIn, ...state.checkIns], streak: state.streak + 1 })),
  addProduct: product => set(state => ({ products: [...state.products, product] })),
  removeProduct: id => set(state => ({ products: state.products.filter(p => p.id !== id) })),
  setOnboarded: val => set({ hasOnboarded: val }),
}));
