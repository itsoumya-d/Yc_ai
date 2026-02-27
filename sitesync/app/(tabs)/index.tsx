import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Site, SitePhoto } from "@/types/index";

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<SitePhoto[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SitePhoto[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [sitesRes, photosRes] = await Promise.all([
      supabase.from("sites").select("*").eq("user_id", user.id).eq("status", "active").limit(5),
      supabase
        .from("site_photos")
        .select("*")
        .eq("user_id", user.id)
        .order("captured_at", { ascending: false })
        .limit(10),
    ]);

    const photos: SitePhoto[] = (photosRes.data as SitePhoto[]) ?? [];
    setSites((sitesRes.data as Site[]) ?? []);
    setRecentPhotos(photos.slice(0, 6));
    setSafetyAlerts(photos.filter((p) => p.has_safety_violation));
    setLoading(false);
    setRefreshing(false);
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
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} tintColor="#d97706" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>SiteSync</Text>
            <Text style={styles.subtitle}>Construction Progress Tracker</Text>
          </View>
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={() => router.push("/(tabs)/capture")}
          >
            <Text style={styles.captureBtnText}>Capture</Text>
          </TouchableOpacity>
        </View>

        {/* Safety Alerts */}
        {safetyAlerts.length > 0 && (
          <Card style={styles.alertBanner}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>⚠</Text>
              <Text style={styles.alertTitle}>
                {safetyAlerts.length} Safety Violation{safetyAlerts.length !== 1 ? "s" : ""} Detected
              </Text>
            </View>
            <Text style={styles.alertDesc}>
              AI has flagged potential safety issues in recent photos. Review immediately.
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/photos")}>
              <Text style={styles.alertLink}>Review photos →</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{sites.length}</Text>
            <Text style={styles.statLabel}>Active Sites</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{recentPhotos.length}</Text>
            <Text style={styles.statLabel}>Photos Today</Text>
          </Card>
          <Card style={[styles.statCard, safetyAlerts.length > 0 && styles.dangerCard]}>
            <Text style={[styles.statValue, safetyAlerts.length > 0 && styles.dangerValue]}>
              {safetyAlerts.length}
            </Text>
            <Text style={styles.statLabel}>Safety Flags</Text>
          </Card>
        </View>

        {/* Active Sites */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Sites</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/reports")}>
              <Text style={styles.sectionLink}>View reports</Text>
            </TouchableOpacity>
          </View>
          {sites.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active sites. Create one in Reports.</Text>
            </Card>
          ) : (
            sites.map((site) => (
              <Card key={site.id} style={styles.siteCard}>
                <View style={styles.siteRow}>
                  <View style={styles.siteLeft}>
                    <Text style={styles.siteName}>{site.name}</Text>
                    <Text style={styles.siteAddress} numberOfLines={1}>{site.address}</Text>
                  </View>
                  <View style={styles.siteRight}>
                    <Badge label={site.phase ?? "In Progress"} variant="warning" />
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${site.progress_pct ?? 0}%` }]}
                      />
                    </View>
                    <Text style={styles.progressPct}>{site.progress_pct ?? 0}%</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Recent Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Photos</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/photos")}>
              <Text style={styles.sectionLink}>View all</Text>
            </TouchableOpacity>
          </View>
          {recentPhotos.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No photos yet. Capture your first site photo.</Text>
            </Card>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoRow}>
                {recentPhotos.map((photo) => (
                  <TouchableOpacity
                    key={photo.id}
                    style={styles.photoThumb}
                    onPress={() => router.push("/(tabs)/photos")}
                  >
                    {photo.photo_url ? (
                      <Image source={{ uri: photo.photo_url }} style={styles.thumbImage} />
                    ) : (
                      <View style={[styles.thumbImage, styles.thumbPlaceholder]}>
                        <Text style={styles.thumbPlaceholderText}>📷</Text>
                      </View>
                    )}
                    {photo.has_safety_violation && (
                      <View style={styles.safetyBadge}>
                        <Text style={styles.safetyBadgeText}>⚠</Text>
                      </View>
                    )}
                    <Text style={styles.photoPhase} numberOfLines={1}>
                      {photo.construction_phase ?? "General"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffbf0" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#1c1917" },
  subtitle: { fontSize: 13, color: "#78716c", marginTop: 2 },
  captureBtn: {
    backgroundColor: "#d97706",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  captureBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  alertBanner: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
    padding: 14,
    marginBottom: 16,
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  alertIcon: { fontSize: 16, color: "#dc2626" },
  alertTitle: { fontSize: 14, fontWeight: "700", color: "#dc2626" },
  alertDesc: { fontSize: 12, color: "#7f1d1d", marginBottom: 8 },
  alertLink: { fontSize: 13, fontWeight: "600", color: "#dc2626" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: { flex: 1, padding: 14, alignItems: "center" },
  dangerCard: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#1c1917" },
  dangerValue: { color: "#dc2626" },
  statLabel: { fontSize: 11, color: "#78716c", marginTop: 2, fontWeight: "500" },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1c1917" },
  sectionLink: { fontSize: 13, color: "#d97706", fontWeight: "600" },
  siteCard: { padding: 12, marginBottom: 8 },
  siteRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  siteLeft: { flex: 1, marginRight: 12 },
  siteRight: { alignItems: "flex-end", gap: 4, minWidth: 80 },
  siteName: { fontSize: 14, fontWeight: "600", color: "#1c1917" },
  siteAddress: { fontSize: 12, color: "#78716c", marginTop: 2 },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: "#e7e5e4",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#d97706", borderRadius: 2 },
  progressPct: { fontSize: 11, color: "#78716c", fontWeight: "600" },
  emptyCard: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#a8a29e", textAlign: "center" },
  photoRow: { flexDirection: "row", gap: 10, paddingBottom: 4 },
  photoThumb: { width: 100 },
  thumbImage: { width: 100, height: 80, borderRadius: 10, backgroundColor: "#e7e5e4" },
  thumbPlaceholder: { alignItems: "center", justifyContent: "center" },
  thumbPlaceholderText: { fontSize: 24 },
  safetyBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#dc2626",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyBadgeText: { fontSize: 10, color: "#fff" },
  photoPhase: { fontSize: 11, color: "#78716c", marginTop: 4, textAlign: "center" },
});
