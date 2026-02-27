import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore, type InspectionPhoto } from '@/stores/inspections';
import {
  COLORS,
  SEVERITY_COLORS,
  SPACING,
  RADIUS,
  PROPERTY_AREAS,
} from '@/constants/theme';
import { getSeverityLabel } from '@/services/ai';
import { uploadPhoto, insertPhotoRecord } from '@/services/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm) / 2;

// ---- Photo Thumbnail Card ----

function PhotoCard({
  photo,
  onPress,
}: {
  photo: InspectionPhoto;
  onPress: () => void;
}) {
  const sev = SEVERITY_COLORS[photo.assessment?.severity ?? 'none'];
  return (
    <TouchableOpacity style={styles.photoCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />

      {/* Upload status indicator */}
      <View
        style={[
          styles.uploadDot,
          {
            backgroundColor:
              photo.uploadStatus === 'uploaded'
                ? COLORS.success
                : photo.uploadStatus === 'failed'
                ? COLORS.error
                : COLORS.warning,
          },
        ]}
      />

      <View style={styles.photoMeta}>
        <Text style={styles.photoArea} numberOfLines={1}>
          {photo.area}
        </Text>
        {photo.assessment && (
          <View style={[styles.severityPill, { backgroundColor: sev.bg }]}>
            <Text style={[styles.severityPillText, { color: sev.text }]}>
              {getSeverityLabel(photo.assessment.severity)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ---- Full Assessment Detail Modal ----

function PhotoDetailModal({
  photo,
  onClose,
}: {
  photo: InspectionPhoto | null;
  onClose: () => void;
}) {
  if (!photo) return null;
  const assessment = photo.assessment;
  const sev = SEVERITY_COLORS[assessment?.severity ?? 'none'];

  return (
    <Modal
      visible={!!photo}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalSafe}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{photo.area}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalContent}>
          {/* Full-size Image */}
          <Image source={{ uri: photo.uri }} style={styles.photoFull} resizeMode="cover" />

          {assessment ? (
            <>
              {/* Severity + Damage Type */}
              <View style={styles.assessRow}>
                <View style={[styles.severityBadge, { backgroundColor: sev.bg }]}>
                  <Text style={[styles.severityBadgeText, { color: sev.text }]}>
                    {getSeverityLabel(assessment.severity)}
                  </Text>
                </View>
                <Text style={styles.damageTypeLabel}>
                  {assessment.damageType.toUpperCase()}
                </Text>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreNum}>{assessment.conditionScore}</Text>
                  <Text style={styles.scoreSlash}>/100</Text>
                </View>
              </View>

              {/* Urgency */}
              <View style={styles.urgencyRow}>
                <Ionicons
                  name={
                    assessment.urgency === 'emergency'
                      ? 'warning'
                      : assessment.urgency === 'prompt'
                      ? 'time-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={16}
                  color={
                    assessment.urgency === 'emergency'
                      ? COLORS.error
                      : assessment.urgency === 'prompt'
                      ? COLORS.warning
                      : COLORS.success
                  }
                />
                <Text style={styles.urgencyText}>
                  {assessment.urgency.charAt(0).toUpperCase() + assessment.urgency.slice(1)} response
                </Text>
              </View>

              <Section title="Description">
                <Text style={styles.bodyText}>{assessment.description}</Text>
              </Section>

              <Section title="Estimated Repair Cost">
                <Text style={styles.costText}>
                  ${assessment.estimatedRepairCost.min.toLocaleString()} –{' '}
                  ${assessment.estimatedRepairCost.max.toLocaleString()}
                </Text>
              </Section>

              <Section title="Affected Area">
                <Text style={styles.bodyText}>{assessment.affectedArea}</Text>
              </Section>

              {assessment.findings.length > 0 && (
                <Section title="Findings">
                  {assessment.findings.map((f, i) => (
                    <Text key={i} style={styles.bulletItem}>• {f}</Text>
                  ))}
                </Section>
              )}

              {assessment.recommendations.length > 0 && (
                <Section title="Recommendations">
                  {assessment.recommendations.map((r, i) => (
                    <Text key={i} style={styles.bulletItem}>• {r}</Text>
                  ))}
                </Section>
              )}

              <Section title="Coverage Relevance">
                <Text style={styles.bodyText}>{assessment.coverageRelevance}</Text>
              </Section>
            </>
          ) : (
            <View style={styles.noAssess}>
              <Ionicons name="analytics-outline" size={40} color={COLORS.border} />
              <Text style={styles.noAssessText}>No AI assessment available</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ---- Main Screen ----

export default function PhotosScreen() {
  const { inspections, activeInspectionId, updatePhoto } = useInspectionStore();
  const activeInspection = inspections.find((i) => i.id === activeInspectionId);

  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<InspectionPhoto | null>(null);
  const [uploading, setUploading] = useState(false);

  const photos = activeInspection?.photos ?? [];
  const filteredPhotos = areaFilter ? photos.filter((p) => p.area === areaFilter) : photos;
  const pendingCount = photos.filter((p) => p.uploadStatus === 'pending').length;

  const usedAreas = [...new Set(photos.map((p) => p.area))];

  const handleUploadAll = useCallback(async () => {
    if (!activeInspection || pendingCount === 0) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    const pending = activeInspection.photos.filter((p) => p.uploadStatus === 'pending');
    for (const photo of pending) {
      try {
        if (!photo.base64) throw new Error('No image data');
        const url = await uploadPhoto(activeInspection.id, photo.id, photo.base64);
        await insertPhotoRecord({
          id: photo.id,
          inspection_id: activeInspection.id,
          area: photo.area,
          storage_url: url,
          damage_type: photo.assessment?.damageType ?? null,
          severity: photo.assessment?.severity ?? null,
          assessment: photo.assessment as Record<string, unknown> ?? null,
          upload_status: 'uploaded',
          captured_at: photo.capturedAt,
        });
        updatePhoto(activeInspection.id, photo.id, { uploadStatus: 'uploaded' });
        successCount++;
      } catch {
        updatePhoto(activeInspection.id, photo.id, { uploadStatus: 'failed' });
        failCount++;
      }
    }

    setUploading(false);
    Alert.alert(
      'Upload Complete',
      `${successCount} photo(s) uploaded successfully.${failCount > 0 ? `\n${failCount} failed — tap Upload All to retry.` : ''}`
    );
  }, [activeInspection, pendingCount, updatePhoto]);

  if (!activeInspection) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Evidence Photos</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={64} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No Active Inspection</Text>
          <Text style={styles.emptyText}>
            Start or select an inspection from the Dashboard to view photos here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeInspection.propertyAddress}
          </Text>
          <Text style={styles.headerSub}>Claim #{activeInspection.claimNumber}</Text>
        </View>
        {pendingCount > 0 && (
          <TouchableOpacity
            style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
            onPress={handleUploadAll}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
                <Text style={styles.uploadBtnText}>Upload {pendingCount}</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Area Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !areaFilter && styles.filterChipActive]}
          onPress={() => setAreaFilter(null)}
        >
          <Text style={[styles.filterChipText, !areaFilter && styles.filterChipTextActive]}>
            All ({photos.length})
          </Text>
        </TouchableOpacity>
        {usedAreas.map((area) => {
          const count = photos.filter((p) => p.area === area).length;
          const active = areaFilter === area;
          return (
            <TouchableOpacity
              key={area}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setAreaFilter(area)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {area} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={56} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No Photos Yet</Text>
          <Text style={styles.emptyText}>
            Go to the Inspect tab to capture photos of damage.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPhotos}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <PhotoCard photo={item} onPress={() => setSelectedPhoto(item)} />
          )}
        />
      )}

      {/* Detail Modal */}
      <PhotoDetailModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? SPACING.md : 4,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  filterBar: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.xs,
  },
  filterChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  filterChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  filterChipTextActive: { color: COLORS.primary },
  grid: { padding: SPACING.md, paddingBottom: 100 },
  row: { gap: SPACING.sm },
  photoCard: {
    width: PHOTO_SIZE,
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  photoThumb: { width: '100%', height: PHOTO_SIZE * 0.75 },
  uploadDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  photoMeta: { padding: 8, gap: 4 },
  photoArea: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  severityPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  severityPillText: { fontSize: 10, fontWeight: '700' },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
  },
  // Modal
  modalSafe: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  modalContent: { padding: SPACING.md, paddingBottom: 60 },
  photoFull: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  assessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  severityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  severityBadgeText: { fontSize: 12, fontWeight: '700' },
  damageTypeLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  scoreCircle: { flexDirection: 'row', alignItems: 'baseline' },
  scoreNum: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  scoreSlash: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 2 },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  urgencyText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  section: { marginTop: SPACING.md },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  bodyText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  costText: { fontSize: 18, fontWeight: '800', color: COLORS.success },
  bulletItem: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginLeft: SPACING.sm },
  noAssess: { alignItems: 'center', paddingTop: SPACING.xl },
  noAssessText: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.sm },
});
