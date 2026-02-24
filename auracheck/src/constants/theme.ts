export const COLORS = {
  primary: '#0D9488', primaryLight: '#14B8A6', primaryDark: '#0F766E',
  success: '#22C55E', warning: '#F59E0B', error: '#EF4444',
  background: '#F0FDFA', card: '#FFFFFF', border: '#CCFBF1',
  text: '#111827', textSecondary: '#6B7280', textMuted: '#9CA3AF',
} as const;

export const BODY_LOCATIONS = [
  'Face', 'Scalp', 'Neck', 'Chest', 'Back (upper)', 'Back (lower)',
  'Shoulder (left)', 'Shoulder (right)', 'Arm (left)', 'Arm (right)',
  'Hand (left)', 'Hand (right)', 'Abdomen', 'Hip', 'Leg (left)', 'Leg (right)',
  'Foot (left)', 'Foot (right)', 'Other',
];

export const RISK_COLORS: Record<string, string> = {
  low: '#22C55E', moderate: '#F59E0B', high: '#EF4444', urgent: '#7F1D1D',
};
