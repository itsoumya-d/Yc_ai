import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { generateReport } from "@/lib/actions/reports";
import { ReportCard } from "@/components/reports/ReportCard";
import type { Report, Site } from "@/types/index";

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [showNewSite, setShowNewSite] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteAddress, setNewSiteAddress] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [reportsRes, sitesRes] = await Promise.all([
      supabase
        .from("reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("sites").select("*").eq("user_id", user.id).eq("status", "active"),
    ]);

    setReports((reportsRes.data as Report[]) ?? []);
    setSites((sitesRes.data as Site[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  const handleCreateSite = async () => {
    if (!newSiteName.trim()) {
      Alert.alert("Error", "Site name is required");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("sites").insert({
      user_id: user.id,
      name: newSiteName,
      address: newSiteAddress || null,
      status: "active",
      phase: "Foundation",
      progress_pct: 0,
    });

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setNewSiteName("");
    setNewSiteAddress("");
    setShowNewSite(false);
    loadData();
    Alert.alert("Created!", "New site added.");
  };

  const handleGenerateReport = async (siteId: string) => {
    setGenerating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setGenerating(false); return; }

    const { error } = await generateReport(siteId, user.id);
    if (error) {
      Alert.alert("Error", error);
    } else {
      Alert.alert("Report Generated!", "Your progress report is ready.");
      loadData();
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#d97706" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Reports</Text>
          <Button
            label="+ New Site"
            onPress={() => setShowNewSite(true)}
            size="sm"
            style={styles.newSiteBtn}
          />
        </View>

        {/* Sites */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Sites</Text>
          {sites.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active sites. Create one to start tracking progress.</Text>
            </Card>
          ) : (
            sites.map((site) => (
              <Card key={site.id} style={styles.siteCard}>
                <View style={styles.siteHeader}>
                  <View>
                    <Text style={styles.siteName}>{site.name}</Text>
                    {site.address && (
                      <Text style={styles.siteAddress}>{site.address}</Text>
                    )}
                  </View>
                  <Badge label={site.phase ?? "Active"} variant="warning" />
                </View>
                <View style={styles.progressSection}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${site.progress_pct ?? 0}%` }]} />
                  </View>
                  <Text style={styles.progressPct}>{site.progress_pct ?? 0}% complete</Text>
                </View>
                <Button
                  label={generating ? "Generating..." : "Generate Report"}
                  onPress={() => handleGenerateReport(site.id)}
                  loading={generating}
                  size="sm"
                  style={styles.generateBtn}
                />
              </Card>
            ))
          )}
        </View>

        {/* Reports List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated Reports ({reports.length})</Text>
          {reports.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                No reports yet. Generate your first report from an active site above.
              </Text>
            </Card>
          ) : (
            reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </View>
      </ScrollView>

      {/* New Site Modal */}
      <Modal visible={showNewSite} animationType="slide" onRequestClose={() => setShowNewSite(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewSite(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Site</Text>
            <TouchableOpacity onPress={handleCreateSite}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Site Name *</Text>
              <TextInput
                style={styles.fieldInput}
                value={newSiteName}
                onChangeText={setNewSiteName}
                placeholder="123 Main St Renovation"
                autoFocus
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                style={styles.fieldInput}
                value={newSiteAddress}
                onChangeText={setNewSiteAddress}
                placeholder="123 Main Street, City, State"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffbf0" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1c1917" },
  newSiteBtn: { backgroundColor: "#d97706" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1c1917", marginBottom: 10 },
  siteCard: { padding: 14, marginBottom: 10 },
  siteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  siteName: { fontSize: 15, fontWeight: "700", color: "#1c1917" },
  siteAddress: { fontSize: 12, color: "#78716c", marginTop: 2 },
  progressSection: { marginBottom: 12 },
  progressBarBg: { height: 6, backgroundColor: "#e7e5e4", borderRadius: 3, overflow: "hidden", marginBottom: 4 },
  progressBarFill: { height: "100%", backgroundColor: "#d97706", borderRadius: 3 },
  progressPct: { fontSize: 12, color: "#78716c", fontWeight: "600" },
  generateBtn: { backgroundColor: "#d97706" },
  emptyCard: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#a8a29e", textAlign: "center" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1c1917" },
  modalCancel: { fontSize: 15, color: "#78716c" },
  modalSave: { fontSize: 15, color: "#d97706", fontWeight: "700" },
  modalScroll: { padding: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  fieldInput: {
    backgroundColor: "#f5f5f4",
    borderWidth: 1.5,
    borderColor: "#e7e5e4",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1c1917",
  },
});
