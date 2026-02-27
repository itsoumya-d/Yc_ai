import { View, Text, Image, StyleSheet } from "react-native";
import { Badge } from "@/components/ui/Badge";
import type { SitePhoto } from "@/types/index";

interface PhotoCardProps {
  photo: SitePhoto;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <View style={styles.card}>
      {photo.photo_url ? (
        <Image
          source={{ uri: photo.photo_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>📷</Text>
        </View>
      )}

      {/* Overlay badges */}
      <View style={styles.overlay}>
        {photo.has_safety_violation && (
          <View style={styles.safetyFlag}>
            <Text style={styles.safetyFlagText}>⚠</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        {photo.construction_phase && (
          <Badge
            label={photo.construction_phase}
            variant="warning"
            style={styles.phaseBadge}
          />
        )}
        <Text style={styles.time}>
          {new Date(photo.captured_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        {photo.gps_lat && (
          <Text style={styles.gps}>📍 GPS</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e7e5e4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 2,
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f4",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: "#f5f5f4",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderIcon: { fontSize: 28 },
  overlay: {
    position: "absolute",
    top: 6,
    right: 6,
    gap: 4,
  },
  safetyFlag: {
    width: 24,
    height: 24,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  safetyFlagText: { fontSize: 11, color: "#fff" },
  info: {
    padding: 8,
    gap: 4,
  },
  phaseBadge: { marginBottom: 2 },
  time: { fontSize: 11, color: "#78716c" },
  gps: { fontSize: 10, color: "#a8a29e" },
});
