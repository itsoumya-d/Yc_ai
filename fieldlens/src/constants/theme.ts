export const COLORS = {
  primary: '#F97316', primaryDark: '#EA580C', primaryLight: '#FB923C',
  secondary: '#1E293B', success: '#22C55E', warning: '#F59E0B', error: '#EF4444',
  background: '#F8FAFC', card: '#FFFFFF', border: '#E2E8F0',
  text: '#0F172A', textSecondary: '#64748B', textMuted: '#94A3B8',
} as const;

export const TRADES = [
  { id: 'plumber' as const, label: 'Plumber', icon: '🔧' },
  { id: 'electrician' as const, label: 'Electrician', icon: '⚡' },
  { id: 'hvac' as const, label: 'HVAC Tech', icon: '❄️' },
  { id: 'carpenter' as const, label: 'Carpenter', icon: '🪚' },
  { id: 'general' as const, label: 'General', icon: '🏗️' },
];
