import { View, Text, StyleSheet, ViewStyle } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantMap = {
  default: { bg: "#f5f5f4", text: "#78716c" },
  success: { bg: "#dcfce7", text: "#16a34a" },
  warning: { bg: "#fef3c7", text: "#d97706" },
  danger: { bg: "#fee2e2", text: "#dc2626" },
  info: { bg: "#dbeafe", text: "#2563eb" },
};

export function Badge({ label, variant = "default", style }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "700" },
});
