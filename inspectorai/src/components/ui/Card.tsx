import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

export function Card({ children, style, padding = 'md', elevated = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        styles[`padding_${padding}`],
        elevated && styles.elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  padding_none: { padding: 0 },
  padding_sm: { padding: 10 },
  padding_md: { padding: 16 },
  padding_lg: { padding: 24 },
});
