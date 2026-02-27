import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  MapPin, Calendar, Camera, DollarSign, FileText, AlertTriangle, CheckCircle, Send,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { getInspectionById } from '@/lib/actions/inspections';
import { generateReport } from '@/lib/actions/reports';
import { formatCostRange } from '@/lib/actions/damage';
import { DamageItemCard } from '@/components/inspections/DamageItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
import type { Inspection } from '@/types';

export default function InspectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    getInspectionById(id)
      .then(setInspection)
      .catch(() => Alert.alert('Error', 'Failed to load inspection'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGenerateReport = useCallback(async () => {
    if (!inspection) return;

    Alert.alert(
      'Generate Report',
      'Generate an AI-powered insurance report for this inspection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            setGeneratingReport(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('Not authenticated');

              const report = await generateReport(inspection, user.id);
              Alert.alert(
                'Report Generated',
                'Your inspection report has been created.',
                [
                  { text: 'View Reports', onPress: () => router.push('/(tabs)/reports') },
                  { text: 'Stay Here', style: 'cancel' },
                ]
              );
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Failed to generate report';
              Alert.alert('Error', message);
            } finally {
              setGeneratingReport(false);
            }
          },
        },
      ]
    );
  }, [inspection, router]);

  if (loading) return <LoadingSpinner fullScreen label="Loading inspection..." />;
  if (!inspection) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Inspection not found</Text>
      </View>
    );
  }

  const statusLabel = inspection.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Property Header */}
        <View style={styles.propertyHeader}>
          <View style={styles.propertyHeaderTop}>
            <View style={styles.propertyInfo}>
              <Text style={styles.propertyName}>{inspection.property.name}</Text>
              <View style={styles.propertyAddressRow}>
                <MapPin size={13} color="#71717a" />
                <Text style={styles.propertyAddress}>{inspection.property.address}</Text>
              </View>
            </View>
            <Badge label={statusLabel} variant={getStatusBadgeVariant(inspection.status)} />
          </View>

          <View style={styles.propertyMeta}>
            <View style={styles.metaItem}>
              <Calendar size={13} color="#71717a" />
              <Text style={styles.metaText}>
                {new Date(inspection.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Camera size={13} color="#71717a" />
              <Text style={styles.metaText}>{inspection.photos.length} photos</Text>
            </View>
            <View style={styles.metaItem}>
              <AlertTriangle size={13} color="#dc2626" />
              <Text style={[styles.metaText, { color: '#dc2626' }]}>
                {inspection.damage_items.length} damage items
              </Text>
            </View>
          </View>

          {inspection.property.insurance_policy && (
            <View style={styles.policyRow}>
              <Text style={styles.policyLabel}>Policy: </Text>
              <Text style={styles.policyValue}>{inspection.property.insurance_policy}</Text>
            </View>
          )}
        </View>

        {/* Cost Summary */}
        {inspection.total_estimate_max > 0 && (
          <View style={styles.costSummaryCard}>
            <View style={styles.costIcon}>
              <DollarSign size={22} color="#dc2626" />
            </View>
            <View style={styles.costInfo}>
              <Text style={styles.costLabel}>Estimated Damage Cost</Text>
              <Text style={styles.costValue}>
                {formatCostRange(inspection.total_estimate_min, inspection.total_estimate_max)}
              </Text>
            </View>
          </View>
        )}

        {/* Photos */}
        {inspection.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspection Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {inspection.photos.map((photo, idx) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => setActivePhotoIndex(idx)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: photo.uri }}
                    style={[
                      styles.photoThumb,
                      activePhotoIndex === idx && styles.photoThumbActive,
                    ]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {inspection.photos[activePhotoIndex] && (
              <Image
                source={{ uri: inspection.photos[activePhotoIndex].uri }}
                style={styles.photoFull}
                resizeMode="cover"
              />
            )}
          </View>
        )}

        {/* Damage Items */}
        {inspection.damage_items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Damage Assessment</Text>
            {inspection.damage_items.map((item) => (
              <DamageItemCard key={item.id} item={item} showPhoto={false} />
            ))}
          </View>
        )}

        {/* Owner Info */}
        {(inspection.property.owner_name || inspection.property.owner_email) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Information</Text>
            <View style={styles.ownerCard}>
              {inspection.property.owner_name && (
                <View style={styles.ownerRow}>
                  <Text style={styles.ownerLabel}>Name</Text>
                  <Text style={styles.ownerValue}>{inspection.property.owner_name}</Text>
                </View>
              )}
              {inspection.property.owner_email && (
                <View style={[styles.ownerRow, styles.ownerRowBorder]}>
                  <Text style={styles.ownerLabel}>Email</Text>
                  <Text style={styles.ownerValue}>{inspection.property.owner_email}</Text>
                </View>
              )}
              {inspection.property.owner_phone && (
                <View style={[styles.ownerRow, styles.ownerRowBorder]}>
                  <Text style={styles.ownerLabel}>Phone</Text>
                  <Text style={styles.ownerValue}>{inspection.property.owner_phone}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {inspection.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{inspection.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Generate Report CTA */}
      {inspection.status === 'completed' && (
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            onPress={handleGenerateReport}
            disabled={generatingReport}
            activeOpacity={0.8}
            style={[styles.ctaButton, generatingReport && styles.ctaButtonDisabled]}
          >
            {generatingReport ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.ctaButtonText}>Generating Report...</Text>
              </>
            ) : (
              <>
                <FileText size={20} color="#ffffff" />
                <Text style={styles.ctaButtonText}>Generate Insurance Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {inspection.status === 'submitted' && (
        <View style={styles.ctaContainer}>
          <View style={styles.submittedBanner}>
            <CheckCircle size={18} color="#16a34a" />
            <Text style={styles.submittedText}>Report submitted for review</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  errorText: { color: '#71717a', textAlign: 'center', marginTop: 40, fontSize: 16 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  propertyHeader: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  propertyHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  propertyInfo: { flex: 1, gap: 4 },
  propertyName: { fontSize: 18, fontWeight: '700', color: '#ffffff' },
  propertyAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  propertyAddress: { fontSize: 13, color: '#71717a', flex: 1 },
  propertyMeta: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#71717a' },
  policyRow: { flexDirection: 'row', alignItems: 'center' },
  policyLabel: { fontSize: 12, color: '#71717a' },
  policyValue: { fontSize: 12, color: '#a1a1aa', fontFamily: 'monospace' },
  costSummaryCard: {
    backgroundColor: '#2d1515',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dc262644',
  },
  costIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#450a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  costInfo: { flex: 1 },
  costLabel: { fontSize: 12, color: '#fca5a5' },
  costValue: { fontSize: 22, fontWeight: '800', color: '#dc2626', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 12 },
  photoScroll: { marginBottom: 10 },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  photoThumbActive: { borderColor: '#dc2626' },
  photoFull: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  ownerCard: { backgroundColor: '#1c1c1e', borderRadius: 12, overflow: 'hidden' },
  ownerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  ownerRowBorder: { borderTopWidth: 1, borderTopColor: '#27272a' },
  ownerLabel: { fontSize: 13, color: '#71717a' },
  ownerValue: { fontSize: 13, color: '#ffffff', fontWeight: '500' },
  notesCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 14,
  },
  notesText: { fontSize: 14, color: '#a1a1aa', lineHeight: 21 },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 36,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
  },
  ctaButton: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  ctaButtonDisabled: { opacity: 0.6 },
  ctaButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  submittedBanner: {
    backgroundColor: '#14532d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  submittedText: { fontSize: 15, fontWeight: '600', color: '#86efac' },
});
