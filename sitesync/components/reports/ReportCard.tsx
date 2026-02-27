import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Report } from "@/types/index";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShowDetail(true)} activeOpacity={0.8}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title} numberOfLines={2}>{report.title}</Text>
              <Text style={styles.date}>
                {new Date(report.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <Badge
              label={report.status}
              variant={report.status === "completed" ? "success" : report.status === "shared" ? "info" : "default"}
            />
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{report.photo_count ?? 0}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, (report.safety_violations ?? 0) > 0 && styles.dangerValue]}>
                {report.safety_violations ?? 0}
              </Text>
              <Text style={styles.statLabel}>Safety Flags</Text>
            </View>
            {report.sites && (
              <>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.siteName} numberOfLines={1}>{report.sites.name}</Text>
                  <Text style={styles.statLabel}>Site</Text>
                </View>
              </>
            )}
          </View>

          <Text style={styles.preview} numberOfLines={2}>
            {report.content?.substring(0, 100)}...
          </Text>

          <Text style={styles.readMore}>Tap to read full report →</Text>
        </Card>
      </TouchableOpacity>

      {/* Report Detail Modal */}
      <Modal visible={showDetail} animationType="slide" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report</Text>
            <View style={{ width: 50 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportDate}>
              Generated: {new Date(report.created_at).toLocaleDateString()}
            </Text>
            <View style={styles.reportStats}>
              <Text style={styles.reportStat}>{report.photo_count ?? 0} photos analyzed</Text>
              <Text style={styles.reportStat}>
                {report.safety_violations ?? 0} safety flags
              </Text>
            </View>
            <Text style={styles.reportContent}>{report.content}</Text>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginBottom: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  headerLeft: { flex: 1, marginRight: 8 },
  title: { fontSize: 14, fontWeight: "700", color: "#1c1917" },
  date: { fontSize: 12, color: "#78716c", marginTop: 2 },
  stats: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#1c1917" },
  dangerValue: { color: "#dc2626" },
  statLabel: { fontSize: 11, color: "#78716c" },
  statDivider: { width: 1, height: 30, backgroundColor: "#e7e5e4" },
  siteName: { fontSize: 13, fontWeight: "600", color: "#1c1917" },
  preview: { fontSize: 13, color: "#78716c", lineHeight: 18, marginBottom: 6 },
  readMore: { fontSize: 12, color: "#d97706", fontWeight: "600" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e7e5e4" },
  modalClose: { fontSize: 15, color: "#d97706", fontWeight: "600" },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalScroll: { padding: 20, paddingBottom: 40 },
  reportTitle: { fontSize: 20, fontWeight: "800", color: "#1c1917", marginBottom: 4 },
  reportDate: { fontSize: 13, color: "#78716c", marginBottom: 12 },
  reportStats: { flexDirection: "row", gap: 16, marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  reportStat: { fontSize: 13, color: "#78716c", fontWeight: "500" },
  reportContent: { fontSize: 14, color: "#374151", lineHeight: 22, whiteSpace: "pre-line" as any },
});
