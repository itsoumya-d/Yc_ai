import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  padding?: Padding;
  highlighted?: boolean;
  style?: ViewStyle;
}

export function Card({ children, padding = 'md', highlighted, style }: CardProps) {
  return (
    <View style={[styles.card, styles[`padding_${padding}`], highlighted && styles.highlighted, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  highlighted: { borderColor: COLORS.primary, borderWidth: 2 },
  padding_none: { padding: 0 },
  padding_sm: { padding: 10 },
  padding_md: { padding: 16 },
  padding_lg: { padding: 24 },
});
