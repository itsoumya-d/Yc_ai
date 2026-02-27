import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";
import { optimizeRoute } from "@/lib/actions/route";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RouteMap } from "@/components/route/RouteMap";
import type { Job } from "@/types/index";

export default function RouteScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [optimizedOrder, setOptimizedOrder] = useState<Job[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  useEffect(() => {
    loadRoute();
    getLocation();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    }
  };

  const loadRoute = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .eq("technician_id", user.id)
      .gte("scheduled_date", todayStart)
      .lt("scheduled_date", todayEnd)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("route_order", { ascending: true, nullsFirst: false });

    const jobList = (data as Job[]) ?? [];
    setJobs(jobList);
    setOptimizedOrder(jobList);
    setLoading(false);
  };

  const handleOptimizeRoute = async () => {
    if (jobs.length === 0) {
      Alert.alert("No Jobs", "No active jobs to optimize.");
      return;
    }
    setOptimizing(true);
    const { data, error } = await optimizeRoute(
      jobs,
      userLocation ?? { lat: 37.7749, lng: -122.4194 }
    );
    if (error) {
      Alert.alert("Error", error);
    } else if (data) {
      setOptimizedOrder(data.optimizedJobs);
      setTotalDistance(data.totalDistanceMiles);
      setEstimatedTime(data.estimatedMinutes);
    }
    setOptimizing(false);
  };

  const handleCompleteJob = async (jobId: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", jobId);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setOptimizedOrder((prev) => prev.filter((j) => j.id !== jobId));
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0369a1" />
      </View>
    );
  }

  const completedCount = jobs.length - optimizedOrder.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>My Route</Text>
          <Text style={styles.subtitle}>Today&apos;s optimized schedule</Text>
        </View>

        {/* Route Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{optimizedOrder.length}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: "#f0fdf4" }]}>
            <Text style={[styles.statValue, { color: "#16a34a" }]}>{completedCount}</Text>
            <Text style={styles.statLabel}>Done</Text>
          </Card>
          {totalDistance && (
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Miles</Text>
            </Card>
          )}
          {estimatedTime && (
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{Math.round(estimatedTime / 60)}h</Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </Card>
          )}
        </View>

        {/* Map */}
        <Card style={styles.mapCard}>
          <RouteMap jobs={optimizedOrder} userLocation={userLocation} />
        </Card>

        {/* Optimize Button */}
        <Button
          label={optimizing ? "Optimizing..." : "Optimize Route with AI"}
          onPress={handleOptimizeRoute}
          loading={optimizing}
          style={styles.optimizeBtn}
        />

        {/* Route List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Order</Text>
          {optimizedOrder.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>All jobs completed for today!</Text>
            </Card>
          ) : (
            optimizedOrder.map((job, index) => (
              <Card key={job.id} style={styles.routeCard}>
                <View style={styles.routeRow}>
                  <View style={styles.routeNumber}>
                    <Text style={styles.routeNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.routeInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                    <Text style={styles.jobAddress} numberOfLines={1}>{job.address}</Text>
                    <View style={styles.routeMeta}>
                      {job.scheduled_time && (
                        <Text style={styles.jobTime}>{job.scheduled_time}</Text>
                      )}
                      <Badge
                        label={job.priority}
                        variant={job.priority === "urgent" ? "danger" : job.priority === "high" ? "warning" : "default"}
                      />
                    </View>
                  </View>
                  <View style={styles.routeActions}>
                    <TouchableOpacity
                      onPress={() => router.push(`/jobs/${job.id}` as any)}
                      style={styles.viewBtn}
                    >
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleCompleteJob(job.id)}
                      style={styles.doneBtn}
                    >
                      <Text style={styles.doneBtnText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
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
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#0c1a2e" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  statCard: { flex: 1, padding: 10, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#0c1a2e" },
  statLabel: { fontSize: 10, color: "#64748b", fontWeight: "600" },
  mapCard: { padding: 0, overflow: "hidden", marginBottom: 14, height: 200 },
  optimizeBtn: { backgroundColor: "#0369a1", marginBottom: 18 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0c1a2e", marginBottom: 10 },
  routeCard: { padding: 12, marginBottom: 8 },
  routeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  routeNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  routeNumberText: { fontSize: 13, fontWeight: "800", color: "#0369a1" },
  routeInfo: { flex: 1 },
  jobTitle: { fontSize: 14, fontWeight: "600", color: "#0c1a2e" },
  jobAddress: { fontSize: 12, color: "#64748b", marginTop: 1 },
  routeMeta: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 },
  jobTime: { fontSize: 12, color: "#0369a1", fontWeight: "600" },
  routeActions: { gap: 6 },
  viewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#dbeafe",
  },
  viewBtnText: { fontSize: 12, color: "#0369a1", fontWeight: "600" },
  doneBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#dcfce7",
  },
  doneBtnText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
  emptyCard: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
});
