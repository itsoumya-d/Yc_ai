import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Job } from "../store/route-store";

const ROUTE_BLUE = "#0369A1";

const STATUS_CONFIG = {
  upcoming:  { bg: "#EFF6FF", text: "#1D4ED8", label: "Upcoming" },
  current:   { bg: "#DBEAFE", text: ROUTE_BLUE, label: "In Progress" },
  completed: { bg: "#DCFCE7", text: "#15803D", label: "Completed" },
  skipped:   { bg: "#FEF2F2", text: "#DC2626", label: "Skipped" },
};

interface Props {
  job: Job;
  onPress?: () => void;
  onNavigate?: () => void;
}

export function JobCard({ job, onPress, onNavigate }: Props) {
  const statusCfg = STATUS_CONFIG[job.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.leftSection}>
        <View style={[styles.stopBadge, job.status === "current" && styles.stopBadgeCurrent]}>
          <Text style={[styles.stopNumber, job.status === "current" && styles.stopNumberCurrent]}>
            {job.stopNumber}
          </Text>
        </View>
        {job.status === "completed" && (
          <View style={styles.completedLine} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.customerName} numberOfLines={1}>{job.customer}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
          </View>
        </View>

        <Text style={styles.address} numberOfLines={2}>{job.address}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="construct-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{job.serviceType}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text style={styles.metaText}>{job.estimatedMinutes}m</Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.timeWindow}>{job.timeWindow}</Text>
          {job.status === "upcoming" || job.status === "current" ? (
            <TouchableOpacity style={styles.navButton} onPress={onNavigate}>
              <Ionicons name="navigate" size={14} color={ROUTE_BLUE} />
              <Text style={styles.navText}>Navigate</Text>
            </TouchableOpacity>
          ) : null}
          {job.status === "completed" && job.rating > 0 && (
            <View style={styles.ratingRow}>
              {Array.from({ length: job.rating }).map((_, i) => (
                <Ionicons key={i} name="star" size={12} color="#F59E0B" />
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  leftSection: {
    alignItems: "center",
    marginRight: 12,
    width: 36,
  },
  stopBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  stopBadgeCurrent: {
    backgroundColor: ROUTE_BLUE,
  },
  stopNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  stopNumberCurrent: {
    color: "#FFFFFF",
  },
  completedLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#DCFCE7",
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  address: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 8,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeWindow: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
  },
  navText: {
    fontSize: 12,
    color: ROUTE_BLUE,
    fontWeight: "600",
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },
});
