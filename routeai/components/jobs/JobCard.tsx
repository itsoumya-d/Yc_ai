import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Job } from "@/types/index";

interface JobCardProps {
  job: Job;
  onPress?: () => void;
}

const priorityColors: Record<string, string> = {
  urgent: "#dc2626",
  high: "#f59e0b",
  normal: "#3b82f6",
  low: "#94a3b8",
};

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "default",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
};

export function JobCard({ job, onPress }: JobCardProps) {
  const dotColor = priorityColors[job.priority] ?? "#3b82f6";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.titleRow}>
              <View style={[styles.priorityDot, { backgroundColor: dotColor }]} />
              <Text style={styles.title} numberOfLines={1}>{job.title}</Text>
            </View>
            {job.customer_name && (
              <Text style={styles.customer} numberOfLines={1}>{job.customer_name}</Text>
            )}
          </View>
          <Badge
            label={job.status.replace(/_/g, " ")}
            variant={statusVariant[job.status] ?? "default"}
          />
        </View>

        <View style={styles.meta}>
          {job.address && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText} numberOfLines={1}>{job.address}</Text>
            </View>
          )}
          {job.scheduled_time && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaText}>{job.scheduled_time}</Text>
            </View>
          )}
          {job.estimated_duration && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱</Text>
              <Text style={styles.metaText}>{job.estimated_duration} min</Text>
            </View>
          )}
          {job.job_type && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🔧</Text>
              <Text style={styles.metaText}>{job.job_type}</Text>
            </View>
          )}
        </View>

        {job.priority === "urgent" && job.status === "pending" && (
          <View style={styles.urgentBanner}>
            <Text style={styles.urgentText}>⚡ Urgent — Needs immediate dispatch</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0c1a2e",
    flex: 1,
  },
  customer: {
    fontSize: 13,
    color: "#64748b",
    marginLeft: 16,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    fontSize: 11,
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
    maxWidth: 120,
  },
  urgentBanner: {
    backgroundColor: "#fee2e2",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 8,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626",
  },
});
