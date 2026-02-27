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
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !companyName) { Alert.alert("Error", "Please fill all fields"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { company_name: companyName } },
    });
    if (error) { Alert.alert("Error", error.message); setLoading(false); return; }
    Alert.alert("Success", "Check your email to confirm.", [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logo}>
            <View style={styles.logoBox}><Text style={styles.logoEmoji}>🏗</Text></View>
            <Text style={styles.appName}>SiteSync</Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Create account</Text>
            <Text style={styles.formSubtitle}>Start documenting job site progress with AI</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Company Name</Text>
              <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} placeholder="ABC Construction" placeholderTextColor="#a8a29e" autoCapitalize="words" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@abcconstruction.com" placeholderTextColor="#a8a29e" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Min. 6 characters" placeholderTextColor="#a8a29e" secureTextEntry />
            </View>
            <Button label="Create Account" onPress={handleSignup} loading={loading} style={styles.btn} />
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity><Text style={styles.loginLink}>Sign in</Text></TouchableOpacity>
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
  logo: { alignItems: "center", marginBottom: 28 },
  logoBox: { width: 56, height: 56, backgroundColor: "#d97706", borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logoEmoji: { fontSize: 26 },
  appName: { fontSize: 26, fontWeight: "800", color: "#fff" },
  form: { backgroundColor: "#292524", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "#44403c" },
  formTitle: { fontSize: 20, fontWeight: "700", color: "#fafaf9", marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: "#78716c", marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#a8a29e", marginBottom: 6 },
  input: { backgroundColor: "#1c1917", borderWidth: 1, borderColor: "#44403c", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#fafaf9" },
  btn: { marginTop: 8, backgroundColor: "#d97706", borderRadius: 12 },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  loginText: { fontSize: 14, color: "#78716c" },
  loginLink: { fontSize: 14, color: "#d97706", fontWeight: "600" },
});
