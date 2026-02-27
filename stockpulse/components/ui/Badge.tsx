import { View, Text, StyleSheet, ViewStyle } from "react-native";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantStyles = {
  default: { bg: "#f1f5f9", text: "#475569" },
  success: { bg: "#dcfce7", text: "#16a34a" },
  warning: { bg: "#fef9c3", text: "#ca8a04" },
  danger: { bg: "#fee2e2", text: "#dc2626" },
  info: { bg: "#dbeafe", text: "#2563eb" },
};

export function Badge({ label, variant = "default", style }: BadgeProps) {
  const vs = variantStyles[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: vs.bg },
        style,
      ]}
    >
      <Text style={[styles.text, { color: vs.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
  },
});
