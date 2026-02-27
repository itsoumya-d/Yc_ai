import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { analyzeConstructionScene, uploadPhotoToSupabase } from '@/services/ai';
import { supabase } from '@/services/supabase';
import { useSiteStore } from '@/stores/sites';
import { usePhotoStore } from '@/stores/photos';
import { useSafetyStore } from '@/stores/safety';
import { COLORS, SITE_ZONES, VIOLATION_COLORS } from '@/constants/theme';
import type { SitePhoto } from '@/stores/photos';

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [selectedZone, setSelectedZone] = useState('general');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastCapture, setLastCapture] = useState<SitePhoto | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const { activeSiteId, sites } = useSiteStore();
  const { addPhoto, updatePhoto } = usePhotoStore();
  const { violations, addViolations } = useSafetyStore();

  const activeSite = sites.find((s) => s.id === activeSiteId);

  useEffect(() => {
    if (locationPermission?.granted) {
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
        .then((loc) =>
          setGpsCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude })
        )
        .catch(() => null);
    }
  }, [locationPermission?.granted]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, styles.permContainer]}>
        <View style={styles.permissionContainer}>
          <View style={styles.permIconBg}>
            <Ionicons name="camera-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.permissionTitle}>Camera Required</Text>
          <Text style={styles.permissionText}>
            SiteSync needs camera access to document construction site progress and
            capture safety evidence.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current) return;
    if (!activeSiteId) {
      Alert.alert(
        'No Active Site',
        'Please select an active site from the Sites tab first.'
      );
      return;
    }

    setAnalyzing(true);
    try {
      // Request location if needed
      let location = null;
      if (!locationPermission?.granted) {
        const result = await requestLocationPermission();
        if (result.granted) {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          }).catch(() => null);
        }
      } else {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }).catch(() => null);
      }

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
        exif: false,
      });
      if (!photo) throw new Error('Failed to capture photo');

      const newPhoto: SitePhoto = {
        id: `photo_${Date.now()}`,
        siteId: activeSiteId,
        zone: selectedZone,
        uri: photo.uri,
        base64: photo.base64 ?? undefined,
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
        uploadStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      addPhoto(newPhoto);
      setLastCapture(newPhoto);

      // Run AI analysis if we have base64
      if (photo.base64) {
        const zoneLabel =
          SITE_ZONES.find((z) => z.id === selectedZone)?.label ?? 'General';
        const analysis = await analyzeConstructionScene(
          photo.base64,
          `${activeSite?.name ?? 'Construction Site'} - ${zoneLabel} zone`
        );

        updatePhoto(newPhoto.id, { analysis });
        setLastCapture((prev) => (prev ? { ...prev, analysis } : null));

        // Save violations to store
        if (analysis.safetyViolations.length > 0) {
          const newViolations = analysis.safetyViolations.map((v, idx) => ({
            id: `${newPhoto.id}_v${idx}`,
            siteId: activeSiteId,
            photoId: newPhoto.id,
            violation: v,
            status: 'open' as const,
            createdAt: new Date().toISOString(),
          }));
          addViolations(newViolations);
        }
      }

      setShowAnalysis(true);
    } catch (err) {
      console.error('Capture error:', err);
      Alert.alert('Capture Failed', 'Failed to capture or analyze photo. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleUpload() {
    if (!lastCapture || !activeSiteId) return;
    setUploading(true);
    try {
      updatePhoto(lastCapture.id, { uploadStatus: 'uploading' });
      const publicUrl = await uploadPhotoToSupabase(
        lastCapture.uri,
        activeSiteId,
        lastCapture.id
      );

      // Save record to Supabase DB
      await supabase.from('site_photos').insert({
        id: lastCapture.id,
        site_id: activeSiteId,
        zone: lastCapture.zone,
        storage_url: publicUrl,
        latitude: lastCapture.latitude,
        longitude: lastCapture.longitude,
        analysis: lastCapture.analysis,
        upload_status: 'uploaded',
      });

      updatePhoto(lastCapture.id, { uploadStatus: 'uploaded', supabaseUrl: publicUrl });
      setLastCapture((prev) => (prev ? { ...prev, uploadStatus: 'uploaded', supabaseUrl: publicUrl } : null));

      Alert.alert('Uploaded', 'Photo uploaded successfully.');
    } catch (err) {
      console.error('Upload error:', err);
      updatePhoto(lastCapture.id, { uploadStatus: 'failed' });
      Alert.alert('Upload Failed', 'Failed to upload. Photo saved locally.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Top overlay: zone selector + site name */}
        <SafeAreaView style={styles.topOverlay}>
          {/* Site indicator */}
          <View style={styles.siteIndicator}>
            <Ionicons name="business" size={12} color="#fff" />
            <Text style={styles.siteIndicatorText} numberOfLines={1}>
              {activeSite?.name ?? 'No site selected'}
            </Text>
          </View>

          {/* Zone chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zoneScrollContent}
          >
            {SITE_ZONES.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zoneChip,
                  selectedZone === zone.id && styles.zoneChipActive,
                ]}
                onPress={() => setSelectedZone(zone.id)}
              >
                <Text
                  style={[
                    styles.zoneChipText,
                    selectedZone === zone.id && styles.zoneChipTextActive,
                  ]}
                >
                  {zone.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>

        {/* GPS Overlay */}
        {gpsCoords && (
          <View style={styles.gpsOverlay}>
            <Ionicons name="location" size={12} color={COLORS.primary} />
            <Text style={styles.gpsText}>
              {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
            </Text>
          </View>
        )}

        {/* Bottom overlay: capture button */}
        <View style={styles.bottomOverlay}>
          {analyzing ? (
            <View style={styles.analyzingContainer}>
              <View style={styles.analyzingSpinner}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
              <Text style={styles.analyzingText}>AI analyzing site...</Text>
            </View>
          ) : (
            <View style={styles.captureRow}>
              <TouchableOpacity
                style={styles.galleryBtn}
                onPress={() => setShowAnalysis(true)}
                disabled={!lastCapture}
              >
                {lastCapture ? (
                  <Image source={{ uri: lastCapture.uri }} style={styles.galleryThumb} />
                ) : (
                  <Ionicons name="images-outline" size={24} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <View style={styles.captureBtnRing}>
                  <View style={styles.captureBtnInner} />
                </View>
              </TouchableOpacity>

              <View style={styles.captureRightSpacer} />
            </View>
          )}
        </View>
      </CameraView>

      {/* Analysis Modal */}
      <Modal
        visible={showAnalysis && lastCapture !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAnalysis(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>AI Analysis</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowAnalysis(false)}
            >
              <Ionicons name="close" size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {lastCapture?.uri && (
              <Image
                source={{ uri: lastCapture.uri }}
                style={styles.analysisImage}
                resizeMode="cover"
              />
            )}

            {/* Photo metadata */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="layers" size={14} color={COLORS.primary} />
                <Text style={styles.metaText}>
                  {SITE_ZONES.find((z) => z.id === lastCapture?.zone)?.label ?? lastCapture?.zone}
                </Text>
              </View>
              {lastCapture?.latitude != null && (
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={14} color={COLORS.primary} />
                  <Text style={styles.metaText}>GPS Tagged</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>
                  {lastCapture?.createdAt
                    ? new Date(lastCapture.createdAt).toLocaleTimeString()
                    : ''}
                </Text>
              </View>
            </View>

            {lastCapture?.analysis ? (
              <>
                {/* Progress Summary */}
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>Progress Summary</Text>
                  <Text style={styles.analysisSummaryText}>
                    {lastCapture.analysis.progressSummary}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Site Progress</Text>
                    <Text style={styles.progressPct}>
                      {lastCapture.analysis.overallProgress}%
                    </Text>
                  </View>
                  <View style={styles.progressBarLarge}>
                    <View
                      style={[
                        styles.progressFillLarge,
                        { width: `${lastCapture.analysis.overallProgress}%` as `${number}%` },
                      ]}
                    />
                  </View>
                </View>

                {/* Safety Violations */}
                {lastCapture.analysis.safetyViolations.length > 0 && (
                  <View style={styles.analysisSection}>
                    <View style={styles.violationsHeader}>
                      <Ionicons name="warning" size={16} color={COLORS.error} />
                      <Text style={[styles.analysisSectionTitle, { color: COLORS.error }]}>
                        Safety Violations ({lastCapture.analysis.safetyViolations.length})
                      </Text>
                    </View>
                    {lastCapture.analysis.safetyViolations.map((v, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.violationCard,
                          { borderLeftColor: VIOLATION_COLORS[v.severity] },
                        ]}
                      >
                        <View style={styles.violationCardHeader}>
                          <Text style={styles.violationType}>{v.type}</Text>
                          <View
                            style={[
                              styles.severityBadge,
                              { backgroundColor: VIOLATION_COLORS[v.severity] },
                            ]}
                          >
                            <Text style={styles.severityBadgeText}>
                              {v.severity.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.oshaRef}>{v.oshaReference}</Text>
                        <Text style={styles.violationDesc}>{v.description}</Text>
                        <View style={styles.correctionBox}>
                          <Ionicons
                            name="construct-outline"
                            size={12}
                            color={COLORS.warning}
                          />
                          <Text style={styles.correctionText}>
                            {v.correctionRequired}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Work Completed */}
                {lastCapture.analysis.workCompleted.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>Work Observed</Text>
                    {lastCapture.analysis.workCompleted.map((item, idx) => (
                      <View key={idx} style={styles.bulletRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Crew Activity */}
                {lastCapture.analysis.crewActivity && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>Crew Activity</Text>
                    <Text style={styles.analysisSummaryText}>
                      {lastCapture.analysis.crewActivity}
                    </Text>
                  </View>
                )}

                {/* Weather */}
                {lastCapture.analysis.weatherConditions && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>Site Conditions</Text>
                    <Text style={styles.analysisSummaryText}>
                      {lastCapture.analysis.weatherConditions}
                    </Text>
                  </View>
                )}

                {/* Recommendations */}
                {lastCapture.analysis.recommendations.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>Recommendations</Text>
                    {lastCapture.analysis.recommendations.map((rec, idx) => (
                      <View key={idx} style={styles.recRow}>
                        <Ionicons
                          name="chevron-forward"
                          size={12}
                          color={COLORS.primary}
                        />
                        <Text style={styles.recText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noAnalysis}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.noAnalysisText}>Waiting for AI analysis...</Text>
              </View>
            )}

            <View style={styles.bottomActions}>
              {lastCapture?.uploadStatus === 'uploaded' ? (
                <View style={styles.uploadedBanner}>
                  <Ionicons name="cloud-done" size={18} color={COLORS.success} />
                  <Text style={styles.uploadedBannerText}>Uploaded to Cloud</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.uploadBtn,
                    uploading && styles.uploadBtnDisabled,
                    lastCapture?.uploadStatus === 'failed' && styles.uploadBtnFailed,
                  ]}
                  onPress={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="cloud-upload" size={18} color="#fff" />
                  )}
                  <Text style={styles.uploadBtnText}>
                    {uploading
                      ? 'Uploading...'
                      : lastCapture?.uploadStatus === 'failed'
                      ? 'Retry Upload'
                      : 'Upload to Cloud'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permContainer: {
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  siteIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  siteIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  zoneScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  zoneChip: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  zoneChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  zoneChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  zoneChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  gpsOverlay: {
    position: 'absolute',
    bottom: 130,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gpsText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 44,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  analyzingContainer: {
    alignItems: 'center',
    gap: 10,
  },
  analyzingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  galleryBtn: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  galleryThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  captureBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  captureRightSpacer: {
    width: 52,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  permIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  permissionText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  permissionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  analysisImage: {
    width: '100%',
    height: 220,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  analysisSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
  },
  analysisSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  analysisSummaryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  progressSection: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressPct: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarLarge: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  violationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  violationCard: {
    borderLeftWidth: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  violationCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  violationType: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  oshaRef: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  violationDesc: {
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 17,
    marginBottom: 6,
  },
  correctionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    padding: 6,
  },
  correctionText: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
    lineHeight: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 5,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    lineHeight: 19,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 5,
  },
  recText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
    lineHeight: 19,
  },
  noAnalysis: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  noAnalysisText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  bottomActions: {
    margin: 16,
    marginTop: 8,
  },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  uploadBtnDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  uploadBtnFailed: {
    backgroundColor: COLORS.error,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    paddingVertical: 14,
    borderRadius: 12,
  },
  uploadedBannerText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '700',
  },
});
