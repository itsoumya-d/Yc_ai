import { View, Text, StyleSheet, ViewStyle } from 'react-native';

type BadgeVariant = 'purple' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  purple: { bg: '#3b1f6e', text: '#c4b5fd' },
  success: { bg: '#14532d', text: '#4ade80' },
  warning: { bg: '#451a03', text: '#fbbf24' },
  danger: { bg: '#450a0a', text: '#f87171' },
  neutral: { bg: '#1f2937', text: '#9ca3af' },
  info: { bg: '#0c2340', text: '#38bdf8' },
};

export function Badge({ label, variant = 'purple', style }: BadgeProps) {
  const colors = VARIANT_STYLES[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
