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

export default function SignupScreen() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !storeName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { store_name: storeName },
      },
    });
    if (error) {
      Alert.alert("Sign Up Failed", error.message);
      setLoading(false);
      return;
    }
    Alert.alert("Success", "Check your email to confirm your account.", [
      { text: "OK", onPress: () => router.replace("/(auth)/login") },
    ]);
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
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Track your store inventory with AI</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Store Name</Text>
              <TextInput
                style={styles.input}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="My Store"
                placeholderTextColor="#94a3b8"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="owner@mystore.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor="#94a3b8"
                secureTextEntry
              />
            </View>

            <Button
              label="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupBtn}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign in</Text>
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
  logoContainer: { alignItems: "center", marginBottom: 32 },
  logoBox: {
    width: 56,
    height: 56,
    backgroundColor: "#0f766e",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoIcon: { fontSize: 24, color: "#ffffff" },
  appName: { fontSize: 24, fontWeight: "800", color: "#ffffff" },
  form: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#334155",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#f8fafc", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  field: { marginBottom: 14 },
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
  signupBtn: { marginTop: 8, borderRadius: 12 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  loginText: { fontSize: 14, color: "#64748b" },
  loginLink: { fontSize: 14, color: "#0f766e", fontWeight: "600" },
});
