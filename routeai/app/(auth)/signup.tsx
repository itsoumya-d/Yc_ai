import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function SignupScreen() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !fullName) { Alert.alert("Error", "Fill required fields"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, company_name: companyName } },
    });
    if (error) { Alert.alert("Error", error.message); setLoading(false); return; }
    Alert.alert("Check your email", "Confirm your account to continue.", [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <View style={styles.logoBox}><Text style={styles.logoEmoji}>🗺</Text></View>
            <Text style={styles.appName}>RouteAI</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Create Account</Text>
            <Text style={styles.formSubtitle}>Start optimizing your field operations</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Jane Smith" placeholderTextColor="#94a3b8" autoCapitalize="words" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="Smith Services LLC" placeholderTextColor="#94a3b8" autoCapitalize="words" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="jane@smithservices.com" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min. 6 characters" placeholderTextColor="#94a3b8" secureTextEntry />
            </View>
            <Button label="Create Account" onPress={handleSignup} loading={loading} style={styles.btn} />
            <View style={styles.row}>
              <Text style={styles.rowText}>Have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity><Text style={styles.rowLink}>Sign in</Text></TouchableOpacity>
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
  logo: { alignItems: "center", marginBottom: 28 },
  logoBox: { width: 56, height: 56, backgroundColor: "#0369a1", borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logoEmoji: { fontSize: 26 },
  appName: { fontSize: 26, fontWeight: "800", color: "#fff" },
  form: { backgroundColor: "#1e3a5f", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#2d5a8e" },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#f0f9ff", marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: "#64748b", marginBottom: 20 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6 },
  input: { backgroundColor: "#0c1a2e", borderWidth: 1, borderColor: "#2d5a8e", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#f0f9ff" },
  btn: { marginTop: 8, backgroundColor: "#0369a1", borderRadius: 12 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  rowText: { fontSize: 14, color: "#64748b" },
  rowLink: { fontSize: 14, color: "#38bdf8", fontWeight: "600" },
});
