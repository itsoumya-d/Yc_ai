import { View, StyleSheet, ViewProps } from 'react-native';
import { COLORS } from '@/constants/theme';

interface CardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  highlighted?: boolean;
}

export function Card({ padding = 'md', highlighted = false, style, children, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        styles[`padding_${padding}`],
        highlighted && styles.highlighted,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  highlighted: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  // Padding variants
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: 8,
  },
  padding_md: {
    padding: 16,
  },
  padding_lg: {
    padding: 24,
  },
});
