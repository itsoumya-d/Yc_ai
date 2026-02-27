import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { DocumentTypeSelector } from '../../components/scan/DocumentTypeSelector';
import { uploadAndExtractDocument } from '../../lib/actions/documents';
import type { DocumentType, ExtractedFields } from '../../types';

export default function ScanScreen() {
  const [selectedType, setSelectedType] = useState<DocumentType>('id');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedFields | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setExtractedFields(null);
    }
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to scan documents.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setExtractedFields(null);
    }
  };

  const handleExtract = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const fields = await uploadAndExtractDocument(imageUri, selectedType);
      setExtractedFields(fields);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to extract document fields.');
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    if (!extractedFields) return null;
    return Object.entries(extractedFields).map(([key, value]) => (
      <View key={key} style={styles.fieldRow}>
        <Text style={styles.fieldKey}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
        <Text style={styles.fieldValue}>{String(value)}</Text>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Document</Text>
        <Text style={styles.subtitle}>Upload or photograph your document</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Document Type</Text>
        <DocumentTypeSelector selected={selectedType} onSelect={setSelectedType} />

        <View style={styles.uploadArea}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📄</Text>
              <Text style={styles.placeholderText}>No document selected</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickFromCamera}>
            <Text style={styles.uploadBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickFromGallery}>
            <Text style={styles.uploadBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <TouchableOpacity
            style={[styles.extractBtn, loading && styles.extractBtnDisabled]}
            onPress={handleExtract}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.extractBtnText}>Extract Information</Text>
            )}
          </TouchableOpacity>
        )}

        {extractedFields && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>Extracted Fields</Text>
            {renderFields()}
            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save to Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#1d4ed8',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#bfdbfe', marginTop: 2 },
  content: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, marginTop: 8 },
  uploadArea: {
    height: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderIcon: { fontSize: 48, marginBottom: 8 },
  placeholderText: { fontSize: 14, color: '#94a3b8' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  uploadBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadBtnText: { color: '#1d4ed8', fontWeight: '600' },
  extractBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  extractBtnDisabled: { opacity: 0.6 },
  extractBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  resultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fieldKey: { fontSize: 13, color: '#64748b', flex: 1 },
  fieldValue: { fontSize: 13, color: '#1e293b', fontWeight: '500', flex: 1, textAlign: 'right' },
  saveBtn: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#ffffff', fontWeight: '600' },
});
