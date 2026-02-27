import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { parseJobFromText } from "@/lib/actions/ai";
import { JobCard } from "@/components/jobs/JobCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Job } from "@/types/index";

type StatusFilter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

export default function JobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showNewJob, setShowNewJob] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiParsing, setAiParsing] = useState(false);
  const [parsedJob, setParsedJob] = useState<Partial<Job> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [jobs, statusFilter]);

  const loadJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: true })
      .order("priority", { ascending: false });

    setJobs((data as Job[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  const applyFilter = () => {
    if (statusFilter === "all") setFiltered(jobs);
    else setFiltered(jobs.filter((j) => j.status === statusFilter));
  };

  const handleParseJob = async () => {
    if (!aiInput.trim()) return;
    setAiParsing(true);
    const result = await parseJobFromText(aiInput);
    setParsedJob(result);
    setAiParsing(false);
  };

  const handleSaveJob = async () => {
    if (!parsedJob) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from("jobs").insert({
      user_id: user.id,
      title: parsedJob.title ?? "New Job",
      customer_name: parsedJob.customer_name ?? null,
      customer_phone: parsedJob.customer_phone ?? null,
      address: parsedJob.address ?? null,
      description: parsedJob.description ?? null,
      priority: parsedJob.priority ?? "normal",
      status: "pending",
      scheduled_date: parsedJob.scheduled_date ?? new Date().toISOString(),
      scheduled_time: parsedJob.scheduled_time ?? null,
      estimated_duration: parsedJob.estimated_duration ?? 60,
      job_type: parsedJob.job_type ?? null,
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setShowNewJob(false);
      setParsedJob(null);
      setAiInput("");
      loadJobs();
      Alert.alert("Created!", "Job added to your queue.");
    }
    setSaving(false);
  };

  const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "Active" },
    { key: "completed", label: "Done" },
    { key: "cancelled", label: "Cancelled" },
  ];

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0369a1" /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Jobs</Text>
        <Button label="+ New" onPress={() => setShowNewJob(true)} size="sm" style={styles.newBtn} />
      </View>

      {/* Status Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, statusFilter === f.key && styles.filterBtnActive]}
            onPress={() => setStatusFilter(f.key)}
          >
            <Text style={[styles.filterText, statusFilter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard job={item} onPress={() => router.push(`/jobs/${item.id}` as any)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadJobs(); }} tintColor="#0369a1" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs found. Create one with AI.</Text>
          </View>
        }
      />

      {/* New Job Modal */}
      <Modal visible={showNewJob} animationType="slide" onRequestClose={() => { setShowNewJob(false); setParsedJob(null); setAiInput(""); }}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowNewJob(false); setParsedJob(null); setAiInput(""); }}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Job</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.aiLabel}>Describe the job in plain text:</Text>
            <TextInput
              style={styles.aiInput}
              value={aiInput}
              onChangeText={setAiInput}
              placeholder="e.g. AC repair for John Smith at 123 Oak St tomorrow at 10am, urgent, about 2 hours"
              multiline
              numberOfLines={4}
            />
            <Button
              label={aiParsing ? "Parsing..." : "Parse with AI"}
              onPress={handleParseJob}
              loading={aiParsing}
              style={styles.parseBtn}
            />

            {parsedJob && (
              <Card style={styles.parsedCard}>
                <Text style={styles.parsedTitle}>Parsed Job Details:</Text>
                <View style={styles.parsedRow}>
                  <Text style={styles.parsedLabel}>Title:</Text>
                  <Text style={styles.parsedValue}>{parsedJob.title ?? "–"}</Text>
                </View>
                <View style={styles.parsedRow}>
                  <Text style={styles.parsedLabel}>Customer:</Text>
                  <Text style={styles.parsedValue}>{parsedJob.customer_name ?? "–"}</Text>
                </View>
                <View style={styles.parsedRow}>
                  <Text style={styles.parsedLabel}>Address:</Text>
                  <Text style={styles.parsedValue}>{parsedJob.address ?? "–"}</Text>
                </View>
                <View style={styles.parsedRow}>
                  <Text style={styles.parsedLabel}>Date:</Text>
                  <Text style={styles.parsedValue}>{parsedJob.scheduled_date ? new Date(parsedJob.scheduled_date).toLocaleDateString() : "–"}</Text>
                </View>
                <View style={styles.parsedRow}>
                  <Text style={styles.parsedLabel}>Time:</Text>
                  <Text style={styles.parsedValue}>{parsedJob.scheduled_time ?? "–"}</Text>
                </View>
                <View style={styles.parsedRow}>
                  <Text style={styles.parsedLabel}>Priority:</Text>
                  <Badge label={parsedJob.priority ?? "normal"} variant={parsedJob.priority === "urgent" ? "danger" : parsedJob.priority === "high" ? "warning" : "default"} />
                </View>
                <View style={styles.parsedRow}>
                  <Text style={styles.parsedLabel}>Duration:</Text>
                  <Text style={styles.parsedValue}>{parsedJob.estimated_duration ?? 60} min</Text>
                </View>
                <Button label="Save Job" onPress={handleSaveJob} loading={saving} style={styles.saveBtn} />
              </Card>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#0c1a2e" },
  newBtn: { backgroundColor: "#0369a1" },
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#e0f2fe" },
  filterBtnActive: { backgroundColor: "#0369a1" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#0369a1" },
  filterTextActive: { color: "#fff" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalCancel: { fontSize: 15, color: "#64748b" },
  modalScroll: { padding: 16, paddingBottom: 40 },
  aiLabel: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  aiInput: { backgroundColor: "#f8fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#0c1a2e", minHeight: 100, textAlignVertical: "top", marginBottom: 12 },
  parseBtn: { backgroundColor: "#0369a1" },
  parsedCard: { marginTop: 16, padding: 14 },
  parsedTitle: { fontSize: 14, fontWeight: "700", color: "#0c1a2e", marginBottom: 10 },
  parsedRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  parsedLabel: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  parsedValue: { fontSize: 13, color: "#0c1a2e", fontWeight: "600", flex: 1, textAlign: "right" },
  saveBtn: { backgroundColor: "#0369a1", marginTop: 14 },
});
