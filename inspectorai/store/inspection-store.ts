import { create } from 'zustand';

export type DamageType = 'structural' | 'water' | 'fire' | 'wind' | 'vandalism' | 'wear' | 'other';
export type Severity = 'critical' | 'major' | 'minor' | 'cosmetic';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'submitted';

export interface DamageFinding {
  id: string;
  type: DamageType;
  severity: Severity;
  location: string;
  description: string;
  confidenceScore: number; // 0-100 AI confidence
  estimatedRepairCost: { low: number; high: number };
  aiNotes: string;
  photoUri?: string;
  requiresProfessional: boolean;
}

export interface InspectionRoom {
  id: string;
  name: string;
  findings: DamageFinding[];
  completed: boolean;
}

export interface PropertyInspection {
  id: string;
  propertyAddress: string;
  propertyType: string;
  claimNumber?: string;
  inspectorName: string;
  date: string;
  status: InspectionStatus;
  rooms: InspectionRoom[];
  totalEstimatedCost: { low: number; high: number };
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  notes: string;
  clientName: string;
  policyNumber?: string;
}

export interface InspectionStore {
  inspections: PropertyInspection[];
  activeInspectionId: string | null;
  setActiveInspection: (id: string | null) => void;
  addInspection: (inspection: PropertyInspection) => void;
  addFinding: (inspectionId: string, roomId: string, finding: DamageFinding) => void;
  completeRoom: (inspectionId: string, roomId: string) => void;
  submitInspection: (inspectionId: string) => void;
}

const DEMO_FINDINGS_1: DamageFinding[] = [
  {
    id: 'f1', type: 'water', severity: 'major', location: 'Northeast corner ceiling',
    description: 'Active water staining and discoloration on drywall ceiling. Approximately 3×4 ft affected area. Possible roof or upstairs plumbing leak.',
    confidenceScore: 94, estimatedRepairCost: { low: 1200, high: 2800 },
    aiNotes: 'Water intrusion pattern suggests sustained leak over 2-4 weeks. Mold risk if not addressed promptly. Source investigation required before repair.',
    requiresProfessional: true,
  },
  {
    id: 'f2', type: 'structural', severity: 'critical', location: 'Foundation wall — east side',
    description: 'Horizontal crack running approximately 14 inches along foundation wall block. Indicative of lateral pressure or soil settlement.',
    confidenceScore: 88, estimatedRepairCost: { low: 4500, high: 12000 },
    aiNotes: 'Horizontal cracks in block foundation walls are serious structural indicators. Engineering assessment strongly recommended before any repair.',
    requiresProfessional: true,
  },
];

const DEMO_FINDINGS_2: DamageFinding[] = [
  {
    id: 'f3', type: 'wind', severity: 'major', location: 'Roof — south slope',
    description: 'Multiple missing asphalt shingles on south-facing slope, approximately 80 sq ft exposed. Visible underlayment in two sections.',
    confidenceScore: 97, estimatedRepairCost: { low: 800, high: 2200 },
    aiNotes: 'Shingle loss pattern consistent with high-wind event. Immediate tarping recommended to prevent water infiltration. Full replacement likely needed.',
    requiresProfessional: false,
  },
  {
    id: 'f4', type: 'cosmetic', severity: 'minor', location: 'Front exterior siding',
    description: 'Faded and peeling paint on vinyl siding. No structural damage. Primarily aesthetic.',
    confidenceScore: 99, estimatedRepairCost: { low: 400, high: 900 },
    aiNotes: 'Normal weathering. Clean, prime, and repaint. No structural concern.',
    requiresProfessional: false,
  },
];

const DEMO_INSPECTIONS: PropertyInspection[] = [
  {
    id: 'i1',
    propertyAddress: '1847 Maple Drive, Austin TX 78701',
    propertyType: 'Single Family Residential',
    claimNumber: 'CLM-2025-04821',
    inspectorName: 'James Park',
    date: 'Jan 24, 2025',
    status: 'completed',
    rooms: [
      { id: 'r1', name: 'Living Room', findings: DEMO_FINDINGS_1, completed: true },
      { id: 'r2', name: 'Basement', findings: [DEMO_FINDINGS_1[1]], completed: true },
      { id: 'r3', name: 'Master Bedroom', findings: [], completed: true },
      { id: 'r4', name: 'Kitchen', findings: [], completed: true },
    ],
    totalEstimatedCost: { low: 5700, high: 14800 },
    overallCondition: 'poor',
    notes: 'Significant water and structural damage. Two critical findings requiring immediate professional attention. Recommend denial of occupancy until foundation assessed.',
    clientName: 'Robert & Sarah Chen',
    policyNumber: 'POL-7743892',
  },
  {
    id: 'i2',
    propertyAddress: '920 Oak Circle, Houston TX 77001',
    propertyType: 'Single Family Residential',
    claimNumber: 'CLM-2025-04909',
    inspectorName: 'James Park',
    date: 'Jan 27, 2025',
    status: 'in_progress',
    rooms: [
      { id: 'r5', name: 'Exterior', findings: DEMO_FINDINGS_2, completed: true },
      { id: 'r6', name: 'Interior', findings: [], completed: false },
      { id: 'r7', name: 'Attic', findings: [], completed: false },
    ],
    totalEstimatedCost: { low: 1200, high: 3100 },
    overallCondition: 'fair',
    notes: 'Wind damage to roof. Interior assessment ongoing.',
    clientName: 'Maria Santos',
    policyNumber: 'POL-6629104',
  },
];

export const useInspectionStore = create<InspectionStore>(set => ({
  inspections: DEMO_INSPECTIONS,
  activeInspectionId: null,
  setActiveInspection: id => set({ activeInspectionId: id }),
  addInspection: inspection => set(state => ({ inspections: [inspection, ...state.inspections] })),
  addFinding: (inspectionId, roomId, finding) => set(state => ({
    inspections: state.inspections.map(insp =>
      insp.id === inspectionId ? {
        ...insp,
        rooms: insp.rooms.map(room =>
          room.id === roomId ? { ...room, findings: [...room.findings, finding] } : room
        ),
      } : insp
    ),
  })),
  completeRoom: (inspectionId, roomId) => set(state => ({
    inspections: state.inspections.map(insp =>
      insp.id === inspectionId ? {
        ...insp,
        rooms: insp.rooms.map(r => r.id === roomId ? { ...r, completed: true } : r),
      } : insp
    ),
  })),
  submitInspection: inspectionId => set(state => ({
    inspections: state.inspections.map(i =>
      i.id === inspectionId ? { ...i, status: 'submitted' } : i
    ),
  })),
}));
