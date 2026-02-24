export const COLORS = {
  primary: '#F59E0B',
  primaryDark: '#D97706',
  primaryLight: '#FDE68A',
  secondary: '#1E3A5F',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  critical: '#DC2626',
  safetyRed: '#DC2626',
  safetyOrange: '#EA580C',
  safetyYellow: '#CA8A04',
  safetyGreen: '#15803D',
};

export const SITE_ZONES = [
  { id: 'foundation', label: 'Foundation', icon: 'layers' },
  { id: 'framing', label: 'Framing', icon: 'grid' },
  { id: 'roofing', label: 'Roofing', icon: 'home' },
  { id: 'exterior', label: 'Exterior', icon: 'square' },
  { id: 'interior', label: 'Interior', icon: 'layout' },
  { id: 'electrical', label: 'Electrical', icon: 'zap' },
  { id: 'plumbing', label: 'Plumbing', icon: 'droplet' },
  { id: 'hvac', label: 'HVAC', icon: 'wind' },
  { id: 'general', label: 'General', icon: 'camera' },
];

export const VIOLATION_COLORS: Record<string, string> = {
  low: '#CA8A04',
  medium: '#EA580C',
  high: '#DC2626',
  critical: '#7F1D1D',
};

export const VIOLATION_BG_COLORS: Record<string, string> = {
  low: '#FEF9C3',
  medium: '#FFF7ED',
  high: '#FEF2F2',
  critical: '#FFF1F2',
};
