import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'primary' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: COLORS.success + '20', text: COLORS.success },
  warning: { bg: COLORS.warning + '20', text: COLORS.warning },
  error: { bg: COLORS.error + '20', text: COLORS.error },
  primary: { bg: COLORS.primary + '20', text: COLORS.primary },
  muted: { bg: COLORS.textMuted + '20', text: COLORS.textMuted },
};

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});
