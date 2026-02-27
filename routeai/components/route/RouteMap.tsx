import { View, Text, StyleSheet, ScrollView } from "react-native";
import type { Job } from "@/types/index";

interface RouteMapProps {
  jobs: Job[];
  userLocation?: { lat: number; lng: number } | null;
}

/**
 * RouteMap - Simple route visualization component.
 *
 * In production, this would use react-native-maps with Google Maps or
 * MapBox SDK for a full interactive map experience. This implementation
 * provides a visual route list representation as a fallback that works
 * without native map dependencies being configured.
 *
 * To upgrade to a real map:
 * 1. Install react-native-maps: npx expo install react-native-maps
 * 2. Add Google Maps API key to app.json
 * 3. Replace this component with MapView + Marker + Polyline
 */
export function RouteMap({ jobs, userLocation }: RouteMapProps) {
  const jobsWithCoords = jobs.filter((j) => j.lat && j.lng);

  if (jobsWithCoords.length === 0) {
    return (
      <View style={styles.noMap}>
        <Text style={styles.noMapTitle}>Route Overview</Text>
        <Text style={styles.noMapText}>
          {jobs.length > 0
            ? "Add GPS coordinates to jobs for map visualization"
            : "No jobs on route"}
        </Text>
        {userLocation && (
          <Text style={styles.locationText}>
            Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map placeholder with route list */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>Route Map</Text>
        <Text style={styles.mapSubtitle}>{jobs.length} stops</Text>

        {/* Visual route line */}
        <ScrollView style={styles.routeLine} showsVerticalScrollIndicator={false}>
          {userLocation && (
            <View style={styles.stopRow}>
              <View style={styles.stopDotStart} />
              <View style={styles.stopLine} />
              <Text style={styles.stopLabel}>Start: Your Location</Text>
            </View>
          )}
          {jobs.map((job, index) => (
            <View key={job.id} style={styles.stopRow}>
              <View style={styles.stopDotContainer}>
                <View style={styles.stopDot}>
                  <Text style={styles.stopNumber}>{index + 1}</Text>
                </View>
                {index < jobs.length - 1 && <View style={styles.stopLine} />}
              </View>
              <View style={styles.stopInfo}>
                <Text style={styles.stopTitle} numberOfLines={1}>{job.title}</Text>
                {job.address && (
                  <Text style={styles.stopAddress} numberOfLines={1}>{job.address}</Text>
                )}
                {job.scheduled_time && (
                  <Text style={styles.stopTime}>{job.scheduled_time}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f2fe",
  },
  noMap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f0f9ff",
  },
  noMapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 4,
  },
  noMapText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  locationText: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "monospace",
  },
  mapPlaceholder: {
    flex: 1,
    padding: 14,
    backgroundColor: "#f0f9ff",
  },
  mapTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369a1",
    marginBottom: 2,
  },
  mapSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
  },
  routeLine: {
    flex: 1,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  stopDotContainer: {
    alignItems: "center",
    width: 26,
    marginRight: 8,
  },
  stopDotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#16a34a",
    marginTop: 4,
  },
  stopDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0369a1",
    alignItems: "center",
    justifyContent: "center",
  },
  stopNumber: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  stopLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#bae6fd",
    minHeight: 12,
    marginTop: 2,
  },
  stopInfo: {
    flex: 1,
    paddingBottom: 8,
  },
  stopTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0c1a2e",
  },
  stopAddress: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  stopTime: {
    fontSize: 11,
    color: "#0369a1",
    fontWeight: "600",
    marginTop: 1,
  },
  stopLabel: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "600",
    marginTop: 4,
  },
});
