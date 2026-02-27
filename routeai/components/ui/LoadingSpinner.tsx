import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
}

export function LoadingSpinner({ message, size = "large", color = "#0369a1" }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  message: { fontSize: 14, color: "#64748b", textAlign: "center" },
});
