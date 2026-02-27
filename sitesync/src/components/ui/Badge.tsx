import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'primary' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`bg_${variant}`]]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Background variants
  bg_success: {
    backgroundColor: '#D1FAE5',
  },
  bg_warning: {
    backgroundColor: '#FEF3C7',
  },
  bg_error: {
    backgroundColor: '#FEE2E2',
  },
  bg_primary: {
    backgroundColor: COLORS.primaryLight,
  },
  bg_muted: {
    backgroundColor: '#F1F5F9',
  },

  // Text variants
  text_success: {
    color: COLORS.safetyGreen,
  },
  text_warning: {
    color: COLORS.safetyYellow,
  },
  text_error: {
    color: COLORS.safetyRed,
  },
  text_primary: {
    color: COLORS.primaryDark,
  },
  text_muted: {
    color: COLORS.textSecondary,
  },
});
