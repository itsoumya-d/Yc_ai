import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSiteStore } from '@/stores/sites';
import { usePhotoStore } from '@/stores/photos';
import { COLORS, SITE_ZONES, VIOLATION_COLORS } from '@/constants/theme';
import type { SitePhoto } from '@/stores/photos';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - 40 - 8) / 2;

export default function FeedScreen() {
  const { activeSiteId, sites } = useSiteStore();
  const { photos } = usePhotoStore();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhoto | null>(null);

  const activeSite = sites.find((s) => s.id === activeSiteId);
  const sitePhotos = photos
    .filter((p) => p.siteId === activeSiteId)
    .filter((p) => !selectedZone || p.zone === selectedZone);

  function renderPhoto({ item }: { item: SitePhoto }) {
    const hasViolations =
      item.analysis?.safetyViolations && item.analysis.safetyViolations.length > 0;

    return (
      <TouchableOpacity
        style={styles.photoCard}
        onPress={() => setSelectedPhoto(item)}
        activeOpacity={0.85}
      >
        {item.uri ? (
          <Image
            source={{ uri: item.uri }}
            style={styles.photoImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.photoImage, styles.photoPlaceholder]}>
            <Ionicons name="camera-outline" size={28} color={COLORS.textSecondary} />
          </View>
        )}

        {/* Zone badge */}
        <View style={styles.zoneBadge}>
          <Text style={styles.zoneBadgeText} numberOfLines={1}>
            {SITE_ZONES.find((z) => z.id === item.zone)?.label ?? item.zone}
          </Text>
        </View>

        {/* Upload status */}
        <View
          style={[
            styles.uploadBadge,
            {
              backgroundColor:
                item.uploadStatus === 'uploaded'
                  ? COLORS.success
                  : item.uploadStatus === 'uploading'
                  ? COLORS.primary
                  : item.uploadStatus === 'failed'
                  ? COLORS.error
                  : COLORS.warning,
            },
          ]}
        >
          <Ionicons
            name={
              item.uploadStatus === 'uploaded'
                ? 'cloud-done'
                : item.uploadStatus === 'uploading'
                ? 'cloud-upload'
                : item.uploadStatus === 'failed'
                ? 'cloud-offline'
                : 'time-outline'
            }
            size={12}
            color="#fff"
          />
        </View>

        {/* GPS indicator */}
        {item.latitude != null && (
          <View style={styles.gpsBadge}>
            <Ionicons name="location" size={10} color={COLORS.primary} />
          </View>
        )}

        {/* Safety violation indicator */}
        {hasViolations && (
          <View style={styles.violationBadge}>
            <Ionicons name="warning" size={10} color="#fff" />
            <Text style={styles.violationBadgeCount}>
              {item.analysis!.safetyViolations.length}
            </Text>
          </View>
        )}

        {/* Bottom info */}
        <View style={styles.photoBottom}>
          <Text style={styles.photoTime}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          {item.analysis && (
            <Text style={styles.photoProgress}>
              {item.analysis.overallProgress}%
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Photo Feed</Text>
          <Text style={styles.headerSubtitle}>
            {activeSite?.name ?? 'No site selected'} · {sitePhotos.length} photos
          </Text>
        </View>
      </View>

      {/* Zone filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterScrollContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, !selectedZone && styles.filterChipActive]}
          onPress={() => setSelectedZone(null)}
        >
          <Text
            style={[styles.filterChipText, !selectedZone && styles.filterChipTextActive]}
          >
            All
          </Text>
        </TouchableOpacity>
        {SITE_ZONES.map((zone) => {
          const count = photos.filter(
            (p) => p.siteId === activeSiteId && p.zone === zone.id
          ).length;
          if (count === 0) return null;
          return (
            <TouchableOpacity
              key={zone.id}
              style={[
                styles.filterChip,
                selectedZone === zone.id && styles.filterChipActive,
              ]}
              onPress={() =>
                setSelectedZone(selectedZone === zone.id ? null : zone.id)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedZone === zone.id && styles.filterChipTextActive,
                ]}
              >
                {zone.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Photo Grid */}
      <FlatList
        data={sitePhotos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={56} color={COLORS.border} />
            <Text style={styles.emptyStateTitle}>No Photos</Text>
            <Text style={styles.emptyStateText}>
              {selectedZone
                ? `No photos in ${SITE_ZONES.find((z) => z.id === selectedZone)?.label} zone.`
                : 'Capture photos from the Camera tab to see them here.'}
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={selectedPhoto !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        {selectedPhoto && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {SITE_ZONES.find((z) => z.id === selectedPhoto.zone)?.label ??
                  selectedPhoto.zone}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedPhoto(null)}
              >
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.detailImage}
                resizeMode="cover"
              />

              <View style={styles.detailMeta}>
                <View style={styles.detailMetaItem}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailMetaText}>
                    {new Date(selectedPhoto.createdAt).toLocaleString()}
                  </Text>
                </View>
                {selectedPhoto.latitude != null && (
                  <View style={styles.detailMetaItem}>
                    <Ionicons name="location" size={14} color={COLORS.primary} />
                    <Text style={styles.detailMetaText}>
                      {selectedPhoto.latitude.toFixed(5)},{' '}
                      {selectedPhoto.longitude!.toFixed(5)}
                    </Text>
                  </View>
                )}
                <View style={styles.detailMetaItem}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={14}
                    color={
                      selectedPhoto.uploadStatus === 'uploaded'
                        ? COLORS.success
                        : COLORS.textSecondary
                    }
                  />
                  <Text style={styles.detailMetaText}>
                    {selectedPhoto.uploadStatus.charAt(0).toUpperCase() +
                      selectedPhoto.uploadStatus.slice(1)}
                  </Text>
                </View>
              </View>

              {selectedPhoto.analysis ? (
                <View style={styles.detailAnalysis}>
                  <Text style={styles.detailSectionTitle}>AI Analysis</Text>
                  <Text style={styles.detailSummary}>
                    {selectedPhoto.analysis.progressSummary}
                  </Text>

                  <View style={styles.detailProgressRow}>
                    <Text style={styles.detailProgressLabel}>
                      Progress: {selectedPhoto.analysis.overallProgress}%
                    </Text>
                    <View style={styles.detailProgressBar}>
                      <View
                        style={[
                          styles.detailProgressFill,
                          {
                            width: `${selectedPhoto.analysis.overallProgress}%` as `${number}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {selectedPhoto.analysis.safetyViolations.length > 0 && (
                    <>
                      <Text style={[styles.detailSectionTitle, { color: COLORS.error, marginTop: 14 }]}>
                        Safety Violations
                      </Text>
                      {selectedPhoto.analysis.safetyViolations.map((v, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.detailViolation,
                            { borderLeftColor: VIOLATION_COLORS[v.severity] },
                          ]}
                        >
                          <Text style={styles.detailViolationType}>{v.type}</Text>
                          <Text style={styles.detailViolationRef}>{v.oshaReference}</Text>
                          <Text style={styles.detailViolationDesc}>{v.description}</Text>
                        </View>
                      ))}
                    </>
                  )}

                  {selectedPhoto.analysis.recommendations.length > 0 && (
                    <>
                      <Text style={[styles.detailSectionTitle, { marginTop: 14 }]}>
                        Recommendations
                      </Text>
                      {selectedPhoto.analysis.recommendations.map((rec, idx) => (
                        <Text key={idx} style={styles.detailRec}>
                          • {rec}
                        </Text>
                      ))}
                    </>
                  )}
                </View>
              ) : (
                <View style={styles.detailAnalysis}>
                  <Text style={styles.detailSectionTitle}>AI Analysis</Text>
                  <Text style={styles.detailSummary}>
                    No analysis available for this photo.
                  </Text>
                </View>
              )}

              <View style={{ height: 32 }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterScroll: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  grid: {
    padding: 16,
    paddingBottom: 32,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
  },
  photoCard: {
    width: THUMB_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  photoImage: {
    width: '100%',
    height: THUMB_SIZE * 0.9,
  },
  photoPlaceholder: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: THUMB_SIZE - 60,
  },
  zoneBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  uploadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsBadge: {
    position: 'absolute',
    top: 36,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  violationBadge: {
    position: 'absolute',
    bottom: 32,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  violationBadgeCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  photoBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  photoTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  photoProgress: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailImage: {
    width: '100%',
    height: 260,
  },
  detailMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailMetaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  detailAnalysis: {
    margin: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  detailSummary: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  detailProgressRow: {
    marginTop: 12,
    gap: 6,
  },
  detailProgressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailProgressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  detailProgressFill: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  detailViolation: {
    borderLeftWidth: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  detailViolationType: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  detailViolationRef: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailViolationDesc: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 17,
  },
  detailRec: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
    marginBottom: 4,
  },
});
