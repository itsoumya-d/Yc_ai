import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
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
    if (!email || !password) { Alert.alert("Error", "Fill in all fields"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { Alert.alert("Login Failed", error.message); setLoading(false); return; }
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <View style={styles.logoBox}><Text style={styles.logoEmoji}>🗺</Text></View>
            <Text style={styles.appName}>RouteAI</Text>
            <Text style={styles.tagline}>AI Dispatch & Route Optimization</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Sign in</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="dispatch@company.com" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry />
            </View>
            <Button label="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />
            <View style={styles.row}>
              <Text style={styles.rowText}>No account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity><Text style={styles.rowLink}>Sign up</Text></TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0c1a2e" },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  logo: { alignItems: "center", marginBottom: 36 },
  logoBox: { width: 64, height: 64, backgroundColor: "#0369a1", borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoEmoji: { fontSize: 30 },
  appName: { fontSize: 28, fontWeight: "800", color: "#fff" },
  tagline: { fontSize: 13, color: "#64748b", marginTop: 4 },
  form: { backgroundColor: "#1e3a5f", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#2d5a8e" },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#f0f9ff", marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6 },
  input: { backgroundColor: "#0c1a2e", borderWidth: 1, borderColor: "#2d5a8e", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#f0f9ff" },
  btn: { marginTop: 8, backgroundColor: "#0369a1", borderRadius: 12 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  rowText: { fontSize: 14, color: "#64748b" },
  rowLink: { fontSize: 14, color: "#38bdf8", fontWeight: "600" },
});
