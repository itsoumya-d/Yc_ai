import { create } from 'zustand';

export type BillType = 'medical' | 'utility' | 'insurance' | 'telecom' | 'credit' | 'other';
export type DisputeStatus = 'pending' | 'submitted' | 'in_review' | 'resolved' | 'rejected';
export type OverchargeType = 'duplicate' | 'incorrect_rate' | 'unauthorized' | 'billing_error' | 'negotiated';

export interface BillLineItem {
  description: string;
  charged: number;
  expected: number;
  isOvercharge: boolean;
  overchargeType?: OverchargeType;
  confidence: number;
}

export interface Bill {
  id: string;
  type: BillType;
  provider: string;
  amount: number;
  dueDate: string;
  scannedAt: string;
  lineItems: BillLineItem[];
  totalOvercharge: number;
  status: 'analyzed' | 'scanning' | 'pending';
  imageUri?: string;
}

export interface Dispute {
  id: string;
  billId: string;
  provider: string;
  amount: number;
  status: DisputeStatus;
  submittedAt: string;
  updatedAt: string;
  referenceNumber: string;
  disputeLetter?: string;
  timeline: { date: string; event: string; }[];
  resolvedAmount?: number;
}

interface ClaimsStore {
  bills: Bill[];
  disputes: Dispute[];
  totalSavings: number;
  activelySaving: number;
  addBill: (bill: Omit<Bill, 'id' | 'scannedAt'>) => void;
  submitDispute: (billId: string, letter: string) => void;
  updateDisputeStatus: (id: string, status: DisputeStatus, resolvedAmount?: number) => void;
}

const DEMO_BILLS: Bill[] = [
  {
    id: 'b1', type: 'medical', provider: 'City General Hospital',
    amount: 1847.50, dueDate: '2026-03-15', scannedAt: '2026-02-20', status: 'analyzed',
    lineItems: [
      { description: 'Emergency Room Visit', charged: 850.00, expected: 450.00, isOvercharge: true, overchargeType: 'incorrect_rate', confidence: 0.94 },
      { description: 'Blood Panel (x2)', charged: 380.00, expected: 190.00, isOvercharge: true, overchargeType: 'duplicate', confidence: 0.99 },
      { description: 'IV Supplies', charged: 210.00, expected: 210.00, isOvercharge: false, confidence: 1.0 },
      { description: 'Physician Consult', charged: 275.00, expected: 150.00, isOvercharge: true, overchargeType: 'incorrect_rate', confidence: 0.88 },
      { description: 'Medication (Ibuprofen)', charged: 132.50, expected: 30.00, isOvercharge: true, overchargeType: 'billing_error', confidence: 0.97 },
    ],
    totalOvercharge: 1017.50,
  },
  {
    id: 'b2', type: 'telecom', provider: 'Frontier Communications',
    amount: 248.00, dueDate: '2026-02-28', scannedAt: '2026-02-18', status: 'analyzed',
    lineItems: [
      { description: 'Internet Service (150Mbps)', charged: 89.99, expected: 69.99, isOvercharge: true, overchargeType: 'incorrect_rate', confidence: 0.91 },
      { description: 'Equipment Rental', charged: 15.99, expected: 15.99, isOvercharge: false, confidence: 1.0 },
      { description: 'HD TV Package', charged: 79.99, expected: 79.99, isOvercharge: false, confidence: 1.0 },
      { description: 'Regional Sports Fee', charged: 15.99, expected: 0, isOvercharge: true, overchargeType: 'unauthorized', confidence: 0.86 },
      { description: 'Broadcast TV Surcharge', charged: 21.99, expected: 15.99, isOvercharge: true, overchargeType: 'billing_error', confidence: 0.82 },
      { description: 'Taxes & Fees', charged: 24.05, expected: 24.05, isOvercharge: false, confidence: 1.0 },
    ],
    totalOvercharge: 42.00,
  },
  {
    id: 'b3', type: 'insurance', provider: 'BlueCross BlueShield',
    amount: 425.00, dueDate: '2026-03-01', scannedAt: '2026-02-22', status: 'analyzed',
    lineItems: [
      { description: 'Monthly Premium (Individual)', charged: 425.00, expected: 325.00, isOvercharge: true, overchargeType: 'incorrect_rate', confidence: 0.79 },
    ],
    totalOvercharge: 100.00,
  },
];

const DEMO_DISPUTES: Dispute[] = [
  {
    id: 'disp1', billId: 'b1', provider: 'City General Hospital',
    amount: 1017.50, status: 'in_review', submittedAt: '2026-02-21', updatedAt: '2026-02-22',
    referenceNumber: 'CLB-2026-00441',
    timeline: [
      { date: 'Feb 20', event: 'Bill scanned and analyzed' },
      { date: 'Feb 21', event: 'Dispute letter generated' },
      { date: 'Feb 21', event: 'Dispute submitted to hospital billing' },
      { date: 'Feb 22', event: 'Acknowledged — under review (15-30 days)' },
    ],
  },
  {
    id: 'disp2', billId: 'b2', provider: 'Frontier Communications',
    amount: 42.00, status: 'resolved', submittedAt: '2026-02-01', updatedAt: '2026-02-14',
    referenceNumber: 'CLB-2026-00388', resolvedAmount: 42.00,
    timeline: [
      { date: 'Feb 1', event: 'Bill analyzed — $42 in overcharges found' },
      { date: 'Feb 1', event: 'Dispute letter sent to Frontier' },
      { date: 'Feb 8', event: 'Frontier acknowledged dispute' },
      { date: 'Feb 14', event: 'Credit applied — $42.00 refunded ✓' },
    ],
  },
  {
    id: 'disp3', billId: 'b3', provider: 'BlueCross BlueShield',
    amount: 100.00, status: 'pending', submittedAt: '2026-02-22', updatedAt: '2026-02-22',
    referenceNumber: 'CLB-2026-00459',
    timeline: [
      { date: 'Feb 22', event: 'Bill scanned — premium overcharge detected' },
      { date: 'Feb 22', event: 'Dispute letter drafted' },
    ],
  },
];

export const useClaimsStore = create<ClaimsStore>((set) => ({
  bills: DEMO_BILLS,
  disputes: DEMO_DISPUTES,
  totalSavings: 1059.50,  // historical resolved
  activelySaving: 1117.50, // in review

  addBill: (bill) =>
    set((state) => ({
      bills: [{ ...bill, id: Date.now().toString(), scannedAt: new Date().toISOString().split('T')[0] }, ...state.bills],
    })),

  submitDispute: (billId, letter) =>
    set((state) => {
      const bill = state.bills.find((b) => b.id === billId);
      if (!bill) return state;
      const dispute: Dispute = {
        id: `disp-${Date.now()}`,
        billId,
        provider: bill.provider,
        amount: bill.totalOvercharge,
        status: 'submitted',
        submittedAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        referenceNumber: `CLB-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`,
        disputeLetter: letter,
        timeline: [
          { date: 'Today', event: `Bill analyzed — $${bill.totalOvercharge.toFixed(2)} in overcharges found` },
          { date: 'Today', event: 'Dispute letter generated and submitted' },
        ],
      };
      return { disputes: [dispute, ...state.disputes], activelySaving: state.activelySaving + bill.totalOvercharge };
    }),

  updateDisputeStatus: (id, status, resolvedAmount) =>
    set((state) => ({
      disputes: state.disputes.map((d) =>
        d.id === id
          ? { ...d, status, updatedAt: new Date().toISOString().split('T')[0], resolvedAmount }
          : d
      ),
      totalSavings: resolvedAmount ? state.totalSavings + resolvedAmount : state.totalSavings,
      activelySaving: resolvedAmount
        ? state.activelySaving - (state.disputes.find((d) => d.id === id)?.amount ?? 0)
        : state.activelySaving,
    })),
}));
