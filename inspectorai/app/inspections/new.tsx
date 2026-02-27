import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Home, Building2, Factory, Car, HelpCircle, Camera, Plus, X, Zap, Check,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { createInspection, updateInspectionStatus } from '@/lib/actions/inspections';
import { analyzePhoto, processInspectionPhotos } from '@/lib/actions/damage';
import type { Property, PropertyType, InspectionPhoto, AIAnalysisResult } from '@/types';

type Step = 'property' | 'photos' | 'analysis' | 'review';

const propertyTypes: { key: PropertyType; label: string; icon: typeof Home }[] = [
  { key: 'residential', label: 'Residential', icon: Home },
  { key: 'commercial', label: 'Commercial', icon: Building2 },
  { key: 'industrial', label: 'Industrial', icon: Factory },
  { key: 'vehicle', label: 'Vehicle', icon: Car },
  { key: 'other', label: 'Other', icon: HelpCircle },
];

interface PhotoWithAnalysis {
  id: string;
  uri: string;
  analysis?: AIAnalysisResult;
  analyzing: boolean;
  error?: string;
}

export default function NewInspectionScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('property');
  const [saving, setSaving] = useState(false);

  // Step 1: Property Info
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [insurancePolicy, setInsurancePolicy] = useState('');

  // Step 2: Photos
  const [photos, setPhotos] = useState<PhotoWithAnalysis[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos: PhotoWithAnalysis[] = result.assets.map((asset) => ({
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        uri: asset.uri,
        analyzing: false,
      }));
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newPhoto: PhotoWithAnalysis = {
        id: `photo-${Date.now()}`,
        uri: asset.uri,
        analyzing: false,
      };
      setPhotos((prev) => [...prev, newPhoto]);
    }
  }, []);

  const removePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const analyzeAllPhotos = useCallback(async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please add at least one photo to analyze.');
      return;
    }

    setAnalyzing(true);
    setStep('analysis');

    const updatedPhotos = [...photos];

    for (let i = 0; i < updatedPhotos.length; i++) {
      const photo = updatedPhotos[i];
      updatedPhotos[i] = { ...photo, analyzing: true };
      setPhotos([...updatedPhotos]);

      try {
        const analysis = await analyzePhoto(photo.uri);
        updatedPhotos[i] = { ...photo, analyzing: false, analysis };
        setPhotos([...updatedPhotos]);
      } catch (err) {
        updatedPhotos[i] = {
          ...photo,
          analyzing: false,
          error: 'Analysis failed',
        };
        setPhotos([...updatedPhotos]);
      }
    }

    setAnalyzing(false);
    setStep('review');
  }, [photos]);

  const handleSave = useCallback(async () => {
    if (!propertyName.trim() || !propertyAddress.trim()) {
      Alert.alert('Error', 'Property name and address are required.');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const property: Property = {
        id: `prop-${Date.now()}`,
        name: propertyName.trim(),
        address: propertyAddress.trim(),
        type: propertyType,
        owner_name: ownerName.trim() || undefined,
        owner_email: ownerEmail.trim() || undefined,
        insurance_policy: insurancePolicy.trim() || undefined,
      };

      const inspection = await createInspection(user.id, property);

      const inspectionPhotos: InspectionPhoto[] = photos
        .filter((p) => p.analysis)
        .map((p) => ({
          id: p.id,
          uri: p.uri,
          analysis: p.analysis,
          analyzed_at: new Date().toISOString(),
        }));

      if (inspectionPhotos.length > 0) {
        await processInspectionPhotos(inspection.id, inspectionPhotos);
        await updateInspectionStatus(inspection.id, 'completed');
      }

      router.replace(`/inspections/${inspection.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save inspection';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  }, [propertyName, propertyAddress, propertyType, ownerName, ownerEmail, insurancePolicy, photos, router]);

  const totalMin = photos
    .filter((p) => p.analysis)
    .reduce((sum, p) => sum + (p.analysis?.estimated_cost_min ?? 0), 0);
  const totalMax = photos
    .filter((p) => p.analysis)
    .reduce((sum, p) => sum + (p.analysis?.estimated_cost_max ?? 0), 0);

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        {(['property', 'photos', 'analysis', 'review'] as Step[]).map((s, i) => (
          <View key={s} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              step === s && styles.progressDotActive,
              ['photos', 'analysis', 'review'].indexOf(step) > i - 1 && styles.progressDotDone,
            ]}>
              <Text style={styles.progressDotText}>{i + 1}</Text>
            </View>
            <Text style={[styles.progressLabel, step === s && styles.progressLabelActive]}>
              {s === 'property' ? 'Property' : s === 'photos' ? 'Photos' : s === 'analysis' ? 'AI Analysis' : 'Review'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* STEP 1: Property Info */}
        {step === 'property' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Property Information</Text>
            <Text style={styles.stepSubtitle}>Enter details about the property being inspected</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Property Name *</Text>
              <TextInput
                style={styles.input}
                value={propertyName}
                onChangeText={setPropertyName}
                placeholder="e.g., 123 Main St - Unit 4B"
                placeholderTextColor="#52525b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={styles.input}
                value={propertyAddress}
                onChangeText={setPropertyAddress}
                placeholder="Street address, city, state, zip"
                placeholderTextColor="#52525b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Property Type *</Text>
              <View style={styles.typeGrid}>
                {propertyTypes.map(({ key, label, icon: Icon }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setPropertyType(key)}
                    activeOpacity={0.8}
                    style={[styles.typeCard, propertyType === key && styles.typeCardActive]}
                  >
                    <Icon size={20} color={propertyType === key ? '#dc2626' : '#52525b'} />
                    <Text style={[styles.typeLabel, propertyType === key && styles.typeLabelActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Owner Name</Text>
              <TextInput
                style={styles.input}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="Property owner's name"
                placeholderTextColor="#52525b"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Owner Email</Text>
              <TextInput
                style={styles.input}
                value={ownerEmail}
                onChangeText={setOwnerEmail}
                placeholder="owner@email.com"
                placeholderTextColor="#52525b"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Insurance Policy Number</Text>
              <TextInput
                style={styles.input}
                value={insurancePolicy}
                onChangeText={setInsurancePolicy}
                placeholder="Policy #"
                placeholderTextColor="#52525b"
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!propertyName.trim() || !propertyAddress.trim()) {
                  Alert.alert('Required', 'Property name and address are required.');
                  return;
                }
                setStep('photos');
              }}
              style={styles.nextButton}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue to Photos</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Photos */}
        {step === 'photos' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Capture Damage Photos</Text>
            <Text style={styles.stepSubtitle}>Take or upload photos of the damage areas</Text>

            <View style={styles.photoActions}>
              <TouchableOpacity onPress={takePhoto} style={styles.photoActionBtn} activeOpacity={0.8}>
                <Camera size={20} color="#dc2626" />
                <Text style={styles.photoActionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickImage} style={styles.photoActionBtn} activeOpacity={0.8}>
                <Plus size={20} color="#dc2626" />
                <Text style={styles.photoActionText}>Upload Photos</Text>
              </TouchableOpacity>
            </View>

            {photos.length > 0 ? (
              <View style={styles.photoGrid}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} resizeMode="cover" />
                    <TouchableOpacity
                      onPress={() => removePhoto(photo.id)}
                      style={styles.photoRemoveBtn}
                    >
                      <X size={12} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.photoEmptyState}>
                <Camera size={40} color="#3f3f46" />
                <Text style={styles.photoEmptyText}>No photos added yet</Text>
                <Text style={styles.photoEmptySubtext}>Capture damage from multiple angles for better AI analysis</Text>
              </View>
            )}

            <View style={styles.bottomButtons}>
              <TouchableOpacity onPress={() => setStep('property')} style={styles.backBtn} activeOpacity={0.8}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={analyzeAllPhotos}
                disabled={photos.length === 0}
                style={[styles.nextButton, styles.nextButtonFlex, photos.length === 0 && styles.buttonDisabled]}
                activeOpacity={0.8}
              >
                <Zap size={18} color="#ffffff" />
                <Text style={styles.nextButtonText}>Analyze with AI</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: Analysis in Progress */}
        {step === 'analysis' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>AI Analysis in Progress</Text>
            <Text style={styles.stepSubtitle}>Our AI is analyzing each damage photo...</Text>

            <View style={styles.analysisList}>
              {photos.map((photo, i) => (
                <View key={photo.id} style={styles.analysisItem}>
                  <Image source={{ uri: photo.uri }} style={styles.analysisThumb} resizeMode="cover" />
                  <View style={styles.analysisInfo}>
                    <Text style={styles.analysisLabel}>Photo {i + 1}</Text>
                    {photo.analyzing ? (
                      <View style={styles.analyzingRow}>
                        <ActivityIndicator size="small" color="#dc2626" />
                        <Text style={styles.analyzingText}>Analyzing...</Text>
                      </View>
                    ) : photo.error ? (
                      <Text style={styles.analysisError}>{photo.error}</Text>
                    ) : photo.analysis ? (
                      <View style={styles.analysisDone}>
                        <Check size={14} color="#16a34a" />
                        <Text style={styles.analysisDoneText}>
                          {photo.analysis.damage_type} — {photo.analysis.severity}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.analysisWaiting}>Waiting...</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {!analyzing && (
              <TouchableOpacity onPress={() => setStep('review')} style={styles.nextButton} activeOpacity={0.8}>
                <Text style={styles.nextButtonText}>View Results</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* STEP 4: Review */}
        {step === 'review' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Save</Text>
            <Text style={styles.stepSubtitle}>AI analysis complete. Review damage summary below.</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{propertyName}</Text>
              <Text style={styles.summaryAddress}>{propertyAddress}</Text>

              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatLabel}>Photos Analyzed</Text>
                <Text style={styles.summaryStatValue}>{photos.filter((p) => p.analysis).length}</Text>
              </View>

              {totalMax > 0 && (
                <View style={styles.summaryCost}>
                  <Text style={styles.summaryCostLabel}>Estimated Damage</Text>
                  <Text style={styles.summaryCostValue}>
                    ${totalMin.toLocaleString()} – ${totalMax.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            {photos.filter((p) => p.analysis).map((photo, i) => (
              <View key={photo.id} style={styles.reviewItem}>
                <View style={styles.reviewItemLeft}>
                  <Image source={{ uri: photo.uri }} style={styles.reviewThumb} resizeMode="cover" />
                </View>
                <View style={styles.reviewItemRight}>
                  <Text style={styles.reviewComponent}>{photo.analysis!.affected_components[0] ?? 'Unknown'}</Text>
                  <Text style={styles.reviewType}>{photo.analysis!.damage_type}</Text>
                  <Text style={styles.reviewDesc} numberOfLines={2}>{photo.analysis!.description}</Text>
                  <Text style={styles.reviewCost}>
                    ${photo.analysis!.estimated_cost_min.toLocaleString()} – ${photo.analysis!.estimated_cost_max.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.bottomButtons}>
              <TouchableOpacity onPress={() => setStep('photos')} style={styles.backBtn} activeOpacity={0.8}>
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={[styles.nextButton, styles.nextButtonFlex, saving && styles.buttonDisabled]}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.nextButtonText}>Save Inspection</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  progressStep: { alignItems: 'center', gap: 4 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: '#dc2626' },
  progressDotDone: { backgroundColor: '#16a34a' },
  progressDotText: { fontSize: 12, fontWeight: '700', color: '#ffffff' },
  progressLabel: { fontSize: 10, color: '#52525b' },
  progressLabelActive: { color: '#dc2626', fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepContent: { gap: 16 },
  stepTitle: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  stepSubtitle: { fontSize: 14, color: '#71717a', marginTop: -8 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#a1a1aa' },
  input: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#ffffff',
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1c1c1e',
    borderWidth: 1.5,
    borderColor: '#27272a',
  },
  typeCardActive: { borderColor: '#dc2626', backgroundColor: '#2d1515' },
  typeLabel: { fontSize: 13, color: '#71717a', fontWeight: '500' },
  typeLabelActive: { color: '#dc2626' },
  nextButton: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  nextButtonFlex: { flex: 1 },
  nextButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  buttonDisabled: { opacity: 0.5 },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#dc2626',
    borderStyle: 'dashed',
  },
  photoActionText: { fontSize: 14, color: '#dc2626', fontWeight: '600' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoItem: { position: 'relative', width: '31%', aspectRatio: 1 },
  photoThumbnail: { width: '100%', height: '100%', borderRadius: 8 },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
  },
  photoEmptyText: { fontSize: 15, color: '#71717a', fontWeight: '500' },
  photoEmptySubtext: { fontSize: 12, color: '#52525b', textAlign: 'center', paddingHorizontal: 20 },
  bottomButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#1c1c1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 15, color: '#a1a1aa', fontWeight: '600' },
  analysisList: { gap: 10 },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  analysisThumb: { width: 60, height: 60, borderRadius: 8 },
  analysisInfo: { flex: 1, gap: 4 },
  analysisLabel: { fontSize: 13, fontWeight: '600', color: '#ffffff' },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  analyzingText: { fontSize: 12, color: '#dc2626' },
  analysisError: { fontSize: 12, color: '#ef4444' },
  analysisDone: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  analysisDoneText: { fontSize: 12, color: '#86efac', textTransform: 'capitalize' },
  analysisWaiting: { fontSize: 12, color: '#52525b' },
  summaryCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  summaryAddress: { fontSize: 13, color: '#71717a' },
  summaryStat: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  summaryStatLabel: { fontSize: 13, color: '#71717a' },
  summaryStatValue: { fontSize: 13, fontWeight: '700', color: '#ffffff' },
  summaryCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    paddingTop: 8,
    marginTop: 4,
  },
  summaryCostLabel: { fontSize: 13, color: '#71717a' },
  summaryCostValue: { fontSize: 15, fontWeight: '800', color: '#dc2626' },
  reviewItem: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    overflow: 'hidden',
  },
  reviewItemLeft: { width: 80 },
  reviewThumb: { width: 80, height: 80 },
  reviewItemRight: { flex: 1, padding: 10, gap: 3 },
  reviewComponent: { fontSize: 13, fontWeight: '600', color: '#ffffff', textTransform: 'capitalize' },
  reviewType: { fontSize: 11, color: '#dc2626', textTransform: 'capitalize' },
  reviewDesc: { fontSize: 11, color: '#71717a', lineHeight: 16 },
  reviewCost: { fontSize: 12, fontWeight: '700', color: '#ea580c' },
});
