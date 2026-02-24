export const COLORS = {
  primary: '#DC2626',
  primaryDark: '#B91C1C',
  primaryLight: '#FEE2E2',
  background: '#FFF5F5',
  surface: '#FFFFFF',
  text: '#1C1917',
  textSecondary: '#78716C',
  border: '#E7E5E4',
  success: '#16A34A',
  warning: '#D97706',
  error: '#DC2626',
} as const;

export const SEVERITY_CONFIG = {
  compliant: { color: '#16A34A', bg: '#F0FDF4', label: 'Compliant' },
  low: { color: '#D97706', bg: '#FFFBEB', label: 'Low Risk' },
  medium: { color: '#EA580C', bg: '#FFF7ED', label: 'Medium Risk' },
  high: { color: '#DC2626', bg: '#FEF2F2', label: 'High Risk' },
  critical: { color: '#7F1D1D', bg: '#450A0A', label: 'CRITICAL' },
} as const;

export const VIOLATION_SEVERITY_COLORS = {
  low: '#D97706',
  medium: '#EA580C',
  high: '#DC2626',
  critical: '#7F1D1D',
} as const;

export const WORKER_RISK_CONFIG = {
  minimal: { color: '#16A34A', label: 'Minimal Risk' },
  moderate: { color: '#D97706', label: 'Moderate Risk' },
  serious: { color: '#DC2626', label: 'Serious Risk' },
  imminent_danger: { color: '#7F1D1D', label: 'IMMINENT DANGER' },
} as const;

export const FACILITY_TYPES = [
  'Manufacturing Plant',
  'Construction Site',
  'Warehouse',
  'Distribution Center',
  'Chemical Plant',
  'Food Processing',
  'Healthcare Facility',
  'Office Building',
] as const;

export const INSPECTION_AREAS = [
  'Production Floor',
  'Warehouse/Storage',
  'Loading Dock',
  'Chemical Storage',
  'Emergency Exits',
  'Electrical Room',
  'Break Room',
  'Exterior/Parking',
  'General',
] as const;

export const SCORE_COLORS = {
  getColor: (score: number): string => {
    if (score >= 90) return '#16A34A';
    if (score >= 75) return '#D97706';
    if (score >= 60) return '#EA580C';
    return '#DC2626';
  },
  getLabel: (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Poor';
  },
};
