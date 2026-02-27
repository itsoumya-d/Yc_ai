import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Login Failed", error.message);
      setLoading(false);
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>⊡</Text>
            </View>
            <Text style={styles.appName}>StockPulse</Text>
            <Text style={styles.tagline}>AI Inventory Scanner</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Welcome back</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@store.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <Button
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  logoContainer: { alignItems: "center", marginBottom: 40 },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: "#0f766e",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: { fontSize: 28, color: "#ffffff" },
  appName: { fontSize: 28, fontWeight: "800", color: "#ffffff" },
  tagline: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  form: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#f8fafc", marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6 },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#f8fafc",
  },
  loginBtn: { marginTop: 8, borderRadius: 12 },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  signupText: { fontSize: 14, color: "#64748b" },
  signupLink: { fontSize: 14, color: "#0f766e", fontWeight: "600" },
});
