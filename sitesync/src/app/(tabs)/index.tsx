import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import { useSiteStore } from '@/stores/sites';
import { usePhotoStore } from '@/stores/photos';
import { useSafetyStore } from '@/stores/safety';
import { COLORS } from '@/constants/theme';

export default function SitesDashboard() {
  const { sites, setSites, activeSiteId, setActiveSite } = useSiteStore();
  const { photos } = usePhotoStore();
  const { violations } = useSafetyStore();

  const { isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setSites(data ?? []);
      if (data && data.length > 0 && !activeSiteId) {
        setActiveSite(data[0].id);
      }
      return data;
    },
  });

  const activeSite = sites.find((s) => s.id === activeSiteId);
  const sitePhotos = photos.filter((p) => p.siteId === activeSiteId);
  const pendingUploads = photos.filter((p) => p.uploadStatus === 'pending').length;
  const openViolations = violations.filter((v) => v.status === 'open').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>SiteSync</Text>
          <Text style={styles.headerSubtitle}>Construction Documentation</Text>
        </View>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.push('/settings' as never)}
        >
          <Ionicons name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Site Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Sites</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={14} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Add Site</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={styles.loader} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.siteScrollContent}
            >
              {sites.map((site) => (
                <TouchableOpacity
                  key={site.id}
                  style={[
                    styles.siteCard,
                    activeSiteId === site.id && styles.siteCardActive,
                  ]}
                  onPress={() => setActiveSite(site.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.siteStatusDot,
                      {
                        backgroundColor:
                          site.status === 'active'
                            ? COLORS.success
                            : site.status === 'on_hold'
                            ? COLORS.warning
                            : COLORS.textSecondary,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.siteName,
                      activeSiteId === site.id && styles.siteNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {site.name}
                  </Text>
                  <Text style={styles.siteAddress} numberOfLines={1}>
                    {site.address}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${site.progress ?? 0}%` as `${number}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{site.progress ?? 0}% complete</Text>
                </TouchableOpacity>
              ))}
              {sites.length === 0 && !isLoading && (
                <View style={styles.emptySites}>
                  <Ionicons name="business-outline" size={32} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>No sites yet.{'\n'}Add your first site!</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>

        {/* Stats Row */}
        {activeSite && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="camera" size={18} color={COLORS.primary} />
              <Text style={styles.statValue}>{sitePhotos.length}</Text>
              <Text style={styles.statLabel}>Photos</Text>
            </View>
            <View
              style={[styles.statCard, openViolations > 0 && styles.statCardDanger]}
            >
              <Ionicons
                name="warning"
                size={18}
                color={openViolations > 0 ? COLORS.error : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.statValue,
                  openViolations > 0 && { color: COLORS.error },
                ]}
              >
                {openViolations}
              </Text>
              <Text style={styles.statLabel}>Violations</Text>
            </View>
            <View
              style={[styles.statCard, pendingUploads > 0 && styles.statCardWarning]}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={pendingUploads > 0 ? COLORS.warning : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.statValue,
                  pendingUploads > 0 && { color: COLORS.warning },
                ]}
              >
                {pendingUploads}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={18} color={COLORS.success} />
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {activeSite.progress ?? 0}%
              </Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        )}

        {/* Active Site Details */}
        {activeSite && (
          <View style={styles.activeSiteCard}>
            <View style={styles.activeSiteHeader}>
              <View>
                <Text style={styles.activeSiteName}>{activeSite.name}</Text>
                <Text style={styles.activeSiteAddress}>{activeSite.address}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      activeSite.status === 'active'
                        ? '#DCFCE7'
                        : activeSite.status === 'on_hold'
                        ? '#FEF9C3'
                        : '#F1F5F9',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color:
                        activeSite.status === 'active'
                          ? COLORS.success
                          : activeSite.status === 'on_hold'
                          ? COLORS.warning
                          : COLORS.textSecondary,
                    },
                  ]}
                >
                  {activeSite.status === 'on_hold'
                    ? 'On Hold'
                    : activeSite.status.charAt(0).toUpperCase() +
                      activeSite.status.slice(1)}
                </Text>
              </View>
            </View>
            {activeSite.latitude != null && activeSite.longitude != null && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.locationText}>
                  {activeSite.latitude.toFixed(4)}, {activeSite.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Recent Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Photos</Text>
            {sitePhotos.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/feed' as never)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {sitePhotos.slice(0, 5).map((photo) => (
            <TouchableOpacity
              key={photo.id}
              style={styles.photoRow}
              activeOpacity={0.75}
            >
              {photo.uri ? (
                <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
              ) : (
                <View style={[styles.photoThumb, styles.photoPlaceholder]}>
                  <Ionicons name="camera" size={20} color={COLORS.textSecondary} />
                </View>
              )}
              <View style={styles.photoInfo}>
                <Text style={styles.photoZone}>{photo.zone}</Text>
                <Text style={styles.photoTime}>
                  {new Date(photo.createdAt).toLocaleString()}
                </Text>
                {photo.analysis && (
                  <Text style={styles.photoSummary} numberOfLines={2}>
                    {photo.analysis.progressSummary}
                  </Text>
                )}
                {photo.latitude != null && (
                  <View style={styles.gpsRow}>
                    <Ionicons name="location" size={10} color={COLORS.primary} />
                    <Text style={styles.gpsText}>GPS tagged</Text>
                  </View>
                )}
              </View>
              <View style={styles.photoRightCol}>
                <View
                  style={[
                    styles.uploadBadge,
                    {
                      backgroundColor:
                        photo.uploadStatus === 'uploaded'
                          ? COLORS.success
                          : photo.uploadStatus === 'uploading'
                          ? COLORS.primary
                          : photo.uploadStatus === 'failed'
                          ? COLORS.error
                          : COLORS.warning,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      photo.uploadStatus === 'uploaded'
                        ? 'checkmark'
                        : photo.uploadStatus === 'uploading'
                        ? 'cloud-upload-outline'
                        : photo.uploadStatus === 'failed'
                        ? 'close'
                        : 'time-outline'
                    }
                    size={12}
                    color="#fff"
                  />
                </View>
                {photo.analysis?.safetyViolations &&
                  photo.analysis.safetyViolations.length > 0 && (
                    <View style={styles.violationBadge}>
                      <Text style={styles.violationBadgeText}>
                        {photo.analysis.safetyViolations.length}
                      </Text>
                    </View>
                  )}
              </View>
            </TouchableOpacity>
          ))}

          {sitePhotos.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyStateTitle}>No Photos Yet</Text>
              <Text style={styles.emptyStateText}>
                Tap the Capture tab to start documenting your site.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 24,
  },
  siteScrollContent: {
    paddingVertical: 4,
    paddingRight: 4,
    gap: 8,
  },
  siteCard: {
    width: 160,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  siteCardActive: {
    borderColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  siteStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  siteName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  siteNameActive: {
    color: COLORS.primary,
  },
  siteAddress: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  progressBar: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptySites: {
    width: 180,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statCardDanger: {
    backgroundColor: '#FEF2F2',
  },
  statCardWarning: {
    backgroundColor: '#FFFBEB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeSiteCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  activeSiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activeSiteName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  activeSiteAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  photoPlaceholder: {
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInfo: {
    flex: 1,
  },
  photoZone: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  photoTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  photoSummary: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  gpsText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
  },
  photoRightCol: {
    alignItems: 'center',
    gap: 6,
  },
  uploadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  violationBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  violationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 24,
  },
});
