import { View, StyleSheet, ViewProps } from 'react-native';
import { COLORS } from '@/constants/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: number;
  highlighted?: boolean;
}

export function Card({ children, padding = 16, highlighted = false, style, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        { padding },
        highlighted && styles.highlighted,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  highlighted: {
    borderColor: COLORS.primary + '40',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
