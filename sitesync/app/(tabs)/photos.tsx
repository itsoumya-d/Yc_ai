import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/Badge";
import { PhotoCard } from "@/components/photos/PhotoCard";
import type { SitePhoto } from "@/types/index";

type FilterType = "all" | "safety" | "foundation" | "framing" | "roofing" | "finishes";

export default function PhotosScreen() {
  const [photos, setPhotos] = useState<SitePhoto[]>([]);
  const [filtered, setFiltered] = useState<SitePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto | null>(null);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [photos, filter]);

  const loadPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("site_photos")
      .select("*")
      .eq("user_id", user.id)
      .order("captured_at", { ascending: false });

    setPhotos((data as SitePhoto[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  const applyFilter = () => {
    let result = photos;
    if (filter === "safety") result = result.filter((p) => p.has_safety_violation);
    else if (filter !== "all") {
      result = result.filter(
        (p) => p.construction_phase?.toLowerCase() === filter
      );
    }
    setFiltered(result);
  };

  // Group by date
  const grouped: Record<string, SitePhoto[]> = {};
  filtered.forEach((photo) => {
    const date = new Date(photo.captured_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(photo);
  });

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "safety", label: "Safety Flags" },
    { key: "foundation", label: "Foundation" },
    { key: "framing", label: "Framing" },
    { key: "roofing", label: "Roofing" },
    { key: "finishes", label: "Finishes" },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#d97706" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos</Text>
        <Text style={styles.count}>{filtered.length} photos</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={Object.entries(grouped)}
        keyExtractor={([date]) => date}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPhotos(); }} tintColor="#d97706" />
        }
        renderItem={({ item: [date, datePhotos] }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateLabel}>{date}</Text>
            <View style={styles.photoGrid}>
              {datePhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.gridItem}
                  onPress={() => setSelectedPhoto(photo)}
                >
                  <PhotoCard photo={photo} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter !== "all"
                ? "No photos match this filter."
                : "No photos yet. Capture site photos using the Capture tab."}
            </Text>
          </View>
        }
      />

      {/* Photo Detail Modal */}
      <Modal
        visible={!!selectedPhoto}
        animationType="slide"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedPhoto(null)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Photo Detail</Text>
              <View style={{ width: 50 }} />
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {selectedPhoto.photo_url ? (
                <Image
                  source={{ uri: selectedPhoto.photo_url }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.noImage}>
                  <Text style={styles.noImageText}>No image available</Text>
                </View>
              )}
              <View style={styles.photoDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phase</Text>
                  <Text style={styles.detailValue}>{selectedPhoto.construction_phase ?? "General"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedPhoto.captured_at).toLocaleDateString()}
                  </Text>
                </View>
                {selectedPhoto.gps_lat && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {selectedPhoto.gps_lat.toFixed(4)}, {selectedPhoto.gps_lng?.toFixed(4)}
                    </Text>
                  </View>
                )}
                {selectedPhoto.has_safety_violation && (
                  <View style={styles.safetyAlert}>
                    <Text style={styles.safetyAlertText}>⚠ Safety Violation Detected</Text>
                  </View>
                )}
                {selectedPhoto.ai_tags && selectedPhoto.ai_tags.length > 0 && (
                  <View>
                    <Text style={styles.detailLabel}>AI Tags</Text>
                    <View style={styles.tagsRow}>
                      {selectedPhoto.ai_tags.map((tag, i) => (
                        <Badge key={i} label={tag} variant="info" style={styles.tag} />
                      ))}
                    </View>
                  </View>
                )}
                {selectedPhoto.ai_description && (
                  <View>
                    <Text style={styles.detailLabel}>AI Description</Text>
                    <Text style={styles.aiDescription}>{selectedPhoto.ai_description}</Text>
                  </View>
                )}
                {selectedPhoto.notes && (
                  <View>
                    <Text style={styles.detailLabel}>Notes</Text>
                    <Text style={styles.detailValue}>{selectedPhoto.notes}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffbf0" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: { fontSize: 22, fontWeight: "800", color: "#1c1917" },
  count: { fontSize: 13, color: "#78716c" },
  filterScroll: { flexGrow: 0, marginBottom: 8 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f5f5f4",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterBtnActive: { backgroundColor: "#d97706", borderColor: "#d97706" },
  filterText: { fontSize: 12, fontWeight: "600", color: "#78716c" },
  filterTextActive: { color: "#fff" },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  dateGroup: { marginBottom: 16 },
  dateLabel: { fontSize: 13, fontWeight: "700", color: "#78716c", marginBottom: 8 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridItem: { width: "48%" },
  emptyContainer: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#a8a29e", textAlign: "center", paddingHorizontal: 24 },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
  },
  modalClose: { fontSize: 15, color: "#d97706", fontWeight: "600" },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1c1917" },
  modalScroll: { paddingBottom: 32 },
  fullImage: { width: "100%", height: 300, backgroundColor: "#f5f5f4" },
  noImage: {
    height: 200,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: { color: "#a8a29e", fontSize: 14 },
  photoDetails: { padding: 16, gap: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  detailLabel: { fontSize: 13, color: "#78716c", fontWeight: "600" },
  detailValue: { fontSize: 13, color: "#1c1917", flex: 1, textAlign: "right" },
  safetyAlert: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  safetyAlertText: { fontSize: 14, fontWeight: "700", color: "#dc2626", textAlign: "center" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  tag: { marginBottom: 2 },
  aiDescription: { fontSize: 13, color: "#374151", lineHeight: 20, marginTop: 4 },
});
