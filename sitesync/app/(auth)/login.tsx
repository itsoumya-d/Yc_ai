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
    if (!email || !password) { Alert.alert("Error", "Please fill in all fields"); return; }
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
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>🏗</Text>
            </View>
            <Text style={styles.appName}>SiteSync</Text>
            <Text style={styles.tagline}>Construction Progress AI</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="site@company.com" placeholderTextColor="#a8a29e" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#a8a29e" secureTextEntry />
            </View>
            <Button label="Sign In" onPress={handleLogin} loading={loading} style={styles.btn} />
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>No account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity><Text style={styles.signupLink}>Sign up</Text></TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c1917" },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  logo: { alignItems: "center", marginBottom: 36 },
  logoBox: { width: 64, height: 64, backgroundColor: "#d97706", borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoEmoji: { fontSize: 30 },
  appName: { fontSize: 28, fontWeight: "800", color: "#fff" },
  tagline: { fontSize: 14, color: "#a8a29e", marginTop: 4 },
  form: { backgroundColor: "#292524", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#44403c" },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#fafaf9", marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#a8a29e", marginBottom: 6 },
  input: { backgroundColor: "#1c1917", borderWidth: 1, borderColor: "#44403c", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#fafaf9" },
  btn: { marginTop: 8, backgroundColor: "#d97706", borderRadius: 12 },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  signupText: { fontSize: 14, color: "#78716c" },
  signupLink: { fontSize: 14, color: "#d97706", fontWeight: "600" },
});
