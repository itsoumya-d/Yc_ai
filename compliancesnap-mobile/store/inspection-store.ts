import { create } from 'zustand';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type ViolationCategory = 'fall_protection' | 'electrical' | 'ppe' | 'hazmat' | 'equipment' | 'housekeeping' | 'fire' | 'other';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'submitted';

export interface Violation {
  id: string;
  category: ViolationCategory;
  severity: SeverityLevel;
  description: string;
  oshaCode?: string;
  photoUri?: string;
  location: string;
  voiceNote?: string;
  recommendedAction: string;
  dueDate: string;
  corrected: boolean;
}

export interface Inspection {
  id: string;
  facilityName: string;
  facilityType: 'construction' | 'manufacturing' | 'warehouse' | 'office' | 'healthcare';
  address: string;
  inspectorName: string;
  date: string;
  status: InspectionStatus;
  violations: Violation[];
  complianceScore: number;
  notes: string;
  weatherConditions?: string;
  workers_present?: number;
}

export interface InspectionStore {
  inspections: Inspection[];
  activeInspectionId: string | null;
  addInspection: (inspection: Inspection) => void;
  addViolation: (inspectionId: string, violation: Violation) => void;
  markCorrected: (inspectionId: string, violationId: string) => void;
  setActiveInspection: (id: string | null) => void;
}

const SEVERITY_SCORES: Record<SeverityLevel, number> = {
  critical: -25,
  high: -15,
  medium: -8,
  low: -3,
};

const computeScore = (violations: Violation[]): number => {
  const base = 100;
  const deductions = violations.filter(v => !v.corrected).reduce((sum, v) => sum + SEVERITY_SCORES[v.severity], 0);
  return Math.max(0, base + deductions);
};

const DEMO_VIOLATIONS_1: Violation[] = [
  {
    id: 'v1',
    category: 'fall_protection',
    severity: 'critical',
    description: 'Workers on scaffolding above 10ft without harnesses or guardrails',
    oshaCode: '1926.502(b)',
    location: 'East wing, 3rd floor scaffolding',
    recommendedAction: 'Immediately halt work. Install guardrail system or provide personal fall arrest equipment.',
    dueDate: '2025-01-15',
    corrected: false,
  },
  {
    id: 'v2',
    category: 'electrical',
    severity: 'high',
    description: 'Exposed wiring on temporary power panel, missing GFCI protection',
    oshaCode: '1926.404(b)',
    location: 'South entrance, temp power station',
    recommendedAction: 'Install GFCI protection and cover all exposed conductors.',
    dueDate: '2025-01-16',
    corrected: false,
  },
  {
    id: 'v3',
    category: 'ppe',
    severity: 'medium',
    description: '3 workers observed without hard hats in active construction zone',
    oshaCode: '1926.100(a)',
    location: 'Ground level, materials area',
    recommendedAction: 'Enforce hard hat policy. Post signage. Conduct toolbox talk.',
    dueDate: '2025-01-17',
    corrected: true,
  },
  {
    id: 'v4',
    category: 'housekeeping',
    severity: 'low',
    description: 'Debris and loose materials blocking emergency egress path',
    location: 'Building B, east exit',
    recommendedAction: 'Clear debris and maintain a minimum 28-inch egress path.',
    dueDate: '2025-01-18',
    corrected: false,
  },
];

const DEMO_VIOLATIONS_2: Violation[] = [
  {
    id: 'v5',
    category: 'fire',
    severity: 'high',
    description: 'Fire extinguisher missing from required location',
    oshaCode: '1910.157(c)',
    location: 'Warehouse floor, station 3',
    recommendedAction: 'Replace fire extinguisher and verify monthly inspection schedule.',
    dueDate: '2025-01-20',
    corrected: false,
  },
  {
    id: 'v6',
    category: 'equipment',
    severity: 'medium',
    description: 'Forklift missing backup alarm',
    oshaCode: '1910.178(e)',
    location: 'Loading dock',
    recommendedAction: 'Repair or replace backup alarm before returning forklift to service.',
    dueDate: '2025-01-22',
    corrected: false,
  },
];

export const DEMO_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-001',
    facilityName: 'Riverside Tower Construction',
    facilityType: 'construction',
    address: '421 River Blvd, Austin, TX 78701',
    inspectorName: 'Carlos Martinez',
    date: '2025-01-14',
    status: 'completed',
    violations: DEMO_VIOLATIONS_1,
    complianceScore: computeScore(DEMO_VIOLATIONS_1),
    notes: 'Site has improved since last inspection. Critical fall protection issue must be resolved immediately.',
    weatherConditions: 'Clear, 58°F',
    workers_present: 24,
  },
  {
    id: 'insp-002',
    facilityName: 'Metro Distribution Center',
    facilityType: 'warehouse',
    address: '8900 Industrial Way, Houston, TX 77001',
    inspectorName: 'Sarah Chen',
    date: '2025-01-12',
    status: 'submitted',
    violations: DEMO_VIOLATIONS_2,
    complianceScore: computeScore(DEMO_VIOLATIONS_2),
    notes: 'Overall facility is well-maintained. Two issues requiring prompt attention.',
    workers_present: 45,
  },
  {
    id: 'insp-003',
    facilityName: 'Oak Street Office Complex',
    facilityType: 'office',
    address: '200 Oak St, Dallas, TX 75201',
    inspectorName: 'Carlos Martinez',
    date: '2025-01-08',
    status: 'completed',
    violations: [],
    complianceScore: 100,
    notes: 'Excellent compliance. No violations found.',
    workers_present: 120,
  },
];

export const useInspectionStore = create<InspectionStore>((set) => ({
  inspections: DEMO_INSPECTIONS,
  activeInspectionId: null,

  addInspection: (inspection) =>
    set((state) => ({ inspections: [inspection, ...state.inspections] })),

  addViolation: (inspectionId, violation) =>
    set((state) => ({
      inspections: state.inspections.map((insp) =>
        insp.id === inspectionId
          ? {
              ...insp,
              violations: [...insp.violations, violation],
              complianceScore: computeScore([...insp.violations, violation]),
            }
          : insp
      ),
    })),

  markCorrected: (inspectionId, violationId) =>
    set((state) => ({
      inspections: state.inspections.map((insp) => {
        if (insp.id !== inspectionId) return insp;
        const updated = insp.violations.map((v) =>
          v.id === violationId ? { ...v, corrected: true } : v
        );
        return { ...insp, violations: updated, complianceScore: computeScore(updated) };
      }),
    })),

  setActiveInspection: (id) => set({ activeInspectionId: id }),
}));
