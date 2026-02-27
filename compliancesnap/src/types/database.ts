export type AppTab = 'dashboard' | 'inspections' | 'scanner' | 'violations' | 'reports' | 'more';
export type SeverityLevel = 'critical' | 'major' | 'minor' | 'observation';
export type InspectionStatus = 'draft' | 'in-progress' | 'completed' | 'syncing';
export type ActionStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface Facility {
  id: string;
  name: string;
  location: string;
  score: number;
  violations_open: number;
  last_inspection: string;
}

export interface Violation {
  id: string;
  title: string;
  severity: SeverityLevel;
  regulation: string;
  location: string;
  status: ActionStatus;
  detected_at: string;
}

export interface Inspection {
  id: string;
  facility: string;
  type: string;
  status: InspectionStatus;
  violations_found: number;
  score: number;
  date: string;
  inspector: string;
}

export interface CorrectiveAction {
  id: string;
  violation_title: string;
  severity: SeverityLevel;
  assigned_to: string;
  due_date: string;
  status: ActionStatus;
}
