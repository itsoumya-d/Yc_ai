import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        size === "sm" && styles.sm,
        size === "md" && styles.md,
        size === "lg" && styles.lg,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        variant === "ghost" && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" || variant === "ghost" ? "#0f766e" : "#ffffff"}
        />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "secondary" && styles.textSecondary,
            variant === "ghost" && styles.textGhost,
            size === "sm" && styles.textSm,
            size === "lg" && styles.textLg,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  sm: { paddingHorizontal: 12, paddingVertical: 7, minHeight: 34 },
  md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
  lg: { paddingHorizontal: 24, paddingVertical: 14, minHeight: 52 },
  primary: { backgroundColor: "#0f766e" },
  secondary: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#0f766e",
  },
  danger: { backgroundColor: "#dc2626" },
  ghost: { backgroundColor: "transparent" },
  disabled: { opacity: 0.5 },
  text: { color: "#ffffff", fontWeight: "700", fontSize: 15 },
  textSecondary: { color: "#0f766e" },
  textGhost: { color: "#0f766e" },
  textSm: { fontSize: 13 },
  textLg: { fontSize: 17 },
});
