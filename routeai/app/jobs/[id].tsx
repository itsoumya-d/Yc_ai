import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Job } from "@/types/index";

const CHECKLIST_ITEMS = [
  "Reviewed job details",
  "Confirmed customer appointment",
  "Tools/parts prepared",
  "Customer greeted",
  "Work completed",
  "Customer sign-off obtained",
  "Site cleaned up",
  "Invoice/payment processed",
];

const STATUS_FLOW: Record<string, string> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: "completed",
};

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>(new Array(CHECKLIST_ITEMS.length).fill(false));
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
    setJob(data as Job);
    if (data?.checklist) {
      setChecklist(data.checklist as boolean[]);
    }
    if (data?.field_notes) {
      setNotes(data.field_notes as string[]);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async () => {
    if (!job) return;
    const nextStatus = STATUS_FLOW[job.status] ?? "completed";
    setUpdating(true);

    const updates: Partial<Job> = {
      status: nextStatus as Job["status"],
    };
    if (nextStatus === "in_progress") updates.started_at = new Date().toISOString();
    if (nextStatus === "completed") updates.completed_at = new Date().toISOString();

    const { error } = await supabase.from("jobs").update(updates).eq("id", id);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setJob((prev) => prev ? { ...prev, ...updates } : null);
    }
    setUpdating(false);
  };

  const toggleChecklist = async (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
    await supabase.from("jobs").update({ checklist: newChecklist }).eq("id", id);
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    const newNotes = [...notes, `${new Date().toLocaleTimeString()}: ${note}`];
    await supabase.from("jobs").update({ field_notes: newNotes }).eq("id", id);
    setNotes(newNotes);
    setNote("");
    setAddingNote(false);
  };

  const callCustomer = () => {
    if (job?.customer_phone) {
      Linking.openURL(`tel:${job.customer_phone}`);
    }
  };

  const openMaps = () => {
    if (job?.address) {
      const encoded = encodeURIComponent(job.address);
      Linking.openURL(`https://maps.google.com/?q=${encoded}`);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0369a1" /></View>;
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Job not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const nextStatusLabel = job.status === "pending" ? "Start Job" : job.status === "in_progress" ? "Complete Job" : "Completed";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Badge
          label={job.status.replace(/_/g, " ")}
          variant={job.status === "completed" ? "success" : job.status === "in_progress" ? "warning" : "default"}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Job Info */}
        <Card style={styles.card}>
          <View style={styles.jobHeader}>
            <View style={styles.priorityDot} style={{ ...styles.priorityDot, backgroundColor: job.priority === "urgent" ? "#dc2626" : job.priority === "high" ? "#f59e0b" : "#3b82f6" }} />
            <Text style={styles.jobTitle}>{job.title}</Text>
          </View>
          {job.job_type && <Badge label={job.job_type} variant="info" style={styles.typeBadge} />}

          {job.description && (
            <Text style={styles.description}>{job.description}</Text>
          )}

          <View style={styles.infoGrid}>
            {job.customer_name && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Customer</Text>
                <Text style={styles.infoValue}>{job.customer_name}</Text>
              </View>
            )}
            {job.scheduled_date && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(job.scheduled_date).toLocaleDateString()} {job.scheduled_time ?? ""}
                </Text>
              </View>
            )}
            {job.estimated_duration && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Est. Duration</Text>
                <Text style={styles.infoValue}>{job.estimated_duration} min</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actions}>
          {job.customer_phone && (
            <TouchableOpacity style={styles.actionBtn} onPress={callCustomer}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionLabel}>Call</Text>
            </TouchableOpacity>
          )}
          {job.address && (
            <TouchableOpacity style={styles.actionBtn} onPress={openMaps}>
              <Text style={styles.actionIcon}>📍</Text>
              <Text style={styles.actionLabel}>Navigate</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address */}
        {job.address && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Address</Text>
            <Text style={styles.addressText}>{job.address}</Text>
          </Card>
        )}

        {/* Status Update */}
        {job.status !== "completed" && job.status !== "cancelled" && (
          <Button
            label={nextStatusLabel}
            onPress={handleStatusUpdate}
            loading={updating}
            style={[styles.statusBtn, job.status === "in_progress" && { backgroundColor: "#16a34a" }]}
          />
        )}

        {/* Checklist */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Job Checklist</Text>
          {CHECKLIST_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.checkItem}
              onPress={() => toggleChecklist(i)}
            >
              <View style={[styles.checkbox, checklist[i] && styles.checkboxChecked]}>
                {checklist[i] && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkLabel, checklist[i] && styles.checkLabelDone]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.checkProgress}>
            {checklist.filter(Boolean).length}/{CHECKLIST_ITEMS.length} complete
          </Text>
        </Card>

        {/* Field Notes */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Field Notes</Text>
          {notes.map((n, i) => (
            <Text key={i} style={styles.noteItem}>{n}</Text>
          ))}
          <View style={styles.noteInputRow}>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              onSubmitEditing={addNote}
            />
            <Button label="Add" onPress={addNote} loading={addingNote} size="sm" style={styles.addNoteBtn} />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFound: { fontSize: 16, color: "#64748b", textAlign: "center", marginTop: 40 },
  backLink: { fontSize: 15, color: "#0369a1", textAlign: "center", marginTop: 8 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e0f2fe" },
  backBtn: { paddingVertical: 4 },
  backBtnText: { fontSize: 15, color: "#0369a1", fontWeight: "600" },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { padding: 14, marginBottom: 14 },
  jobHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  jobTitle: { fontSize: 18, fontWeight: "700", color: "#0c1a2e", flex: 1 },
  typeBadge: { marginBottom: 8 },
  description: { fontSize: 14, color: "#64748b", lineHeight: 20, marginBottom: 10 },
  infoGrid: { gap: 8 },
  infoItem: { flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { fontSize: 13, color: "#94a3b8" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#0c1a2e" },
  actions: { flexDirection: "row", gap: 10, marginBottom: 14 },
  actionBtn: { flex: 1, backgroundColor: "#dbeafe", borderRadius: 12, padding: 12, alignItems: "center", gap: 4 },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontSize: 12, fontWeight: "600", color: "#0369a1" },
  addressText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  statusBtn: { backgroundColor: "#0369a1", marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#0c1a2e", marginBottom: 10 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: "#cbd5e1", backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#0369a1", borderColor: "#0369a1" },
  checkmark: { color: "#fff", fontSize: 11, fontWeight: "800" },
  checkLabel: { fontSize: 14, color: "#374151", flex: 1 },
  checkLabelDone: { textDecorationLine: "line-through", color: "#94a3b8" },
  checkProgress: { fontSize: 12, color: "#64748b", textAlign: "right", marginTop: 4 },
  noteItem: { fontSize: 13, color: "#374151", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  noteInputRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  noteInput: { flex: 1, backgroundColor: "#f8fafc", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  addNoteBtn: { backgroundColor: "#0369a1", borderRadius: 8 },
});
