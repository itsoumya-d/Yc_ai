import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const ROUTE_BLUE = "#0369A1";

interface Pin {
  id: string;
  stopNumber: number;
  xPct: number;
  yPct: number;
  status: "upcoming" | "current" | "completed" | "skipped";
}

interface Props {
  pins?: Pin[];
  completedCount?: number;
  totalCount?: number;
}

const DEFAULT_PINS: Pin[] = [
  { id: "j1", stopNumber: 1, xPct: 0.28, yPct: 0.52, status: "completed" },
  { id: "j2", stopNumber: 2, xPct: 0.18, yPct: 0.68, status: "completed" },
  { id: "j3", stopNumber: 3, xPct: 0.32, yPct: 0.40, status: "completed" },
  { id: "j4", stopNumber: 4, xPct: 0.45, yPct: 0.30, status: "current" },
  { id: "j5", stopNumber: 5, xPct: 0.60, yPct: 0.45, status: "upcoming" },
  { id: "j6", stopNumber: 6, xPct: 0.22, yPct: 0.72, status: "upcoming" },
  { id: "j7", stopNumber: 7, xPct: 0.68, yPct: 0.35, status: "upcoming" },
  { id: "j8", stopNumber: 8, xPct: 0.75, yPct: 0.22, status: "upcoming" },
];

const PIN_COLORS = {
  completed: "#15803D",
  current:   ROUTE_BLUE,
  upcoming:  "#6B7280",
  skipped:   "#DC2626",
};

export function MapPlaceholder({ pins = DEFAULT_PINS, completedCount = 3, totalCount = 8 }: Props) {
  const mapHeight = height * 0.55;

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      {/* Map background */}
      <View style={styles.mapBg}>
        {/* Grid lines horizontal */}
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={"h" + i}
            style={[styles.gridLineH, { top: (i / 11) * 100 + "%" }]}
          />
        ))}
        {/* Grid lines vertical */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={"v" + i}
            style={[styles.gridLineV, { left: (i / 7) * 100 + "%" }]}
          />
        ))}

        {/* Street lines simulated */}
        <View style={[styles.street, { top: "35%", left: 0, right: 0, height: 4 }]} />
        <View style={[styles.street, { top: "58%", left: 0, right: 0, height: 3 }]} />
        <View style={[styles.street, { top: "72%", left: 0, right: 0, height: 2 }]} />
        <View style={[styles.streetV, { left: "30%", top: 0, bottom: 0, width: 4 }]} />
        <View style={[styles.streetV, { left: "55%", top: 0, bottom: 0, width: 3 }]} />
        <View style={[styles.streetV, { left: "72%", top: 0, bottom: 0, width: 2 }]} />

        {/* Route path line (SVG-like using Views) */}
        <View style={styles.routePath} />

        {/* Job pins */}
        {pins.map((pin) => (
          <View
            key={pin.id}
            style={[
              styles.pin,
              {
                left: pin.xPct * (width) - 16,
                top: pin.yPct * mapHeight - 16,
                backgroundColor: PIN_COLORS[pin.status],
                borderWidth: pin.status === "current" ? 3 : 2,
                borderColor: pin.status === "current" ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                width: pin.status === "current" ? 36 : 28,
                height: pin.status === "current" ? 36 : 28,
                borderRadius: pin.status === "current" ? 18 : 14,
              },
            ]}
          >
            <Text style={[styles.pinText, pin.status === "current" && styles.pinTextLarge]}>
              {pin.status === "completed" ? "" : pin.stopNumber}
            </Text>
            {pin.status === "completed" && (
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            )}
          </View>
        ))}

        {/* Map attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>Map view simulation</Text>
        </View>
      </View>

      {/* Top overlay bar */}
      <View style={styles.topOverlay}>
        <View style={styles.topOverlayInner}>
          <Ionicons name="navigate-circle" size={18} color={ROUTE_BLUE} />
          <Text style={styles.routeSummary}>
            Today: <Text style={styles.routeHighlight}>8 jobs</Text> · 47 miles · Est. 6h 20m
          </Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{completedCount}/{totalCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  mapBg: {
    flex: 1,
    backgroundColor: "#B8D4E8",
    position: "relative",
    overflow: "hidden",
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  street: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    opacity: 0.75,
  },
  streetV: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    opacity: 0.75,
  },
  routePath: {
    position: "absolute",
    top: "30%",
    left: "20%",
    right: "25%",
    height: 3,
    backgroundColor: ROUTE_BLUE,
    opacity: 0.8,
  },
  pin: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  pinTextLarge: {
    fontSize: 13,
  },
  attribution: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: "#374151",
  },
  topOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
  },
  topOverlayInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  routeSummary: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  routeHighlight: {
    fontWeight: "700",
    color: ROUTE_BLUE,
  },
  progressBadge: {
    backgroundColor: ROUTE_BLUE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
