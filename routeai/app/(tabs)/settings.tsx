import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name ?? "");
        setPhone(user.user_metadata?.phone ?? "");
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone },
    });
    if (error) Alert.alert("Error", error.message);
    else Alert.alert("Saved", "Profile updated.");
    setSaving(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.replace("/(auth)/login" as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        {/* Profile */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your name" />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+1 555 000 0000" keyboardType="phone-pad" />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email ?? ""} editable={false} />
          </View>
          <Button label="Save Profile" onPress={handleSave} loading={saving} style={styles.saveBtn} />
        </Card>

        {/* Preferences */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Text style={styles.toggleDesc}>Job updates and alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
              thumbColor={notifications ? "#0369a1" : "#94a3b8"}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Auto-Optimize Route</Text>
              <Text style={styles.toggleDesc}>Optimize when starting your day</Text>
            </View>
            <Switch
              value={autoOptimize}
              onValueChange={setAutoOptimize}
              trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
              thumbColor={autoOptimize ? "#0369a1" : "#94a3b8"}
            />
          </View>
        </Card>

        {/* App Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>Production</Text>
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          label="Sign Out"
          onPress={handleSignOut}
          loading={signingOut}
          variant="danger"
          style={styles.signOutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: "#0c1a2e", marginBottom: 16 },
  section: { padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0c1a2e", marginBottom: 14 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#64748b", marginBottom: 5 },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0c1a2e",
  },
  inputDisabled: { color: "#94a3b8", backgroundColor: "#f1f5f9" },
  saveBtn: { backgroundColor: "#0369a1", marginTop: 4 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: "#0c1a2e" },
  toggleDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  infoLabel: { fontSize: 14, color: "#64748b" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#0c1a2e" },
  signOutBtn: { marginTop: 8 },
});
