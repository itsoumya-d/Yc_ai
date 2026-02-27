import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { JobCard } from "@/components/jobs/JobCard";
import type { Job, Technician } from "@/types/index";

export default function DispatchScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });

  useEffect(() => {
    loadDispatch();
  }, []);

  const loadDispatch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const [jobsRes, techsRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .gte("scheduled_date", todayStart)
        .lt("scheduled_date", todayEnd)
        .order("priority", { ascending: false })
        .order("scheduled_time"),
      supabase.from("technicians").select("*").eq("user_id", user.id).eq("active", true),
    ]);

    const jobs: Job[] = (jobsRes.data as Job[]) ?? [];
    setTodayJobs(jobs);
    setTechnicians((techsRes.data as Technician[]) ?? []);
    setUnassignedCount(jobs.filter((j) => !j.technician_id).length);
    setStats({
      total: jobs.length,
      completed: jobs.filter((j) => j.status === "completed").length,
      inProgress: jobs.filter((j) => j.status === "in_progress").length,
      pending: jobs.filter((j) => j.status === "pending").length,
    });
    setLoading(false);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0369a1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDispatch(); }} tintColor="#0369a1" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dispatch</Text>
            <Text style={styles.subtitle}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.newJobBtn}
            onPress={() => router.push("/(tabs)/jobs")}
          >
            <Text style={styles.newJobBtnText}>+ Job</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: "#f0f9ff" }]}>
            <Text style={[styles.statValue, { color: "#0369a1" }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: "#fef9c3" }]}>
            <Text style={[styles.statValue, { color: "#ca8a04" }]}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: "#f0fdf4" }]}>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </Card>
        </View>

        {/* Unassigned Alert */}
        {unassignedCount > 0 && (
          <Card style={styles.alertCard}>
            <Text style={styles.alertText}>
              ⚠ {unassignedCount} unassigned job{unassignedCount !== 1 ? "s" : ""} need attention
            </Text>
          </Card>
        )}

        {/* Technician Status */}
        {technicians.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Field Technicians</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.techRow}>
                {technicians.map((tech) => (
                  <Card key={tech.id} style={styles.techCard}>
                    <View style={styles.techAvatar}>
                      <Text style={styles.techInitials}>
                        {tech.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.techName} numberOfLines={1}>{tech.name}</Text>
                    <Badge
                      label={tech.status ?? "available"}
                      variant={tech.status === "en_route" ? "info" : tech.status === "on_job" ? "warning" : "success"}
                    />
                    <Text style={styles.techJobs}>{tech.jobs_today ?? 0} jobs today</Text>
                  </Card>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Today's Jobs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Jobs ({todayJobs.length})</Text>
          {todayJobs.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No jobs scheduled for today.</Text>
            </Card>
          ) : (
            todayJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/jobs/${job.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f9ff" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#0c1a2e" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  newJobBtn: {
    backgroundColor: "#0369a1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newJobBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: { flex: 1, padding: 10, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "800", color: "#0c1a2e" },
  statLabel: { fontSize: 10, color: "#64748b", marginTop: 1, fontWeight: "600" },
  alertCard: {
    backgroundColor: "#fef9c3",
    borderColor: "#fcd34d",
    padding: 12,
    marginBottom: 14,
  },
  alertText: { fontSize: 13, fontWeight: "600", color: "#92400e", textAlign: "center" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0c1a2e", marginBottom: 10 },
  techRow: { flexDirection: "row", gap: 10, paddingBottom: 4 },
  techCard: {
    padding: 12,
    width: 110,
    alignItems: "center",
    gap: 4,
  },
  techAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  techInitials: { fontSize: 15, fontWeight: "700", color: "#0369a1" },
  techName: { fontSize: 12, fontWeight: "600", color: "#0c1a2e", textAlign: "center" },
  techJobs: { fontSize: 11, color: "#64748b" },
  emptyCard: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
});
