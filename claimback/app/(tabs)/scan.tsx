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
import { router } from 'expo-router';
import { BillTypeSelector } from '../../components/scan/BillTypeSelector';
import { OverchargeItem } from '../../components/scan/OverchargeItem';
import { uploadAndAnalyzeBill } from '../../lib/actions/bills';
import type { BillType, BillAnalysis } from '../../types';

export default function ScanScreen() {
  const [billType, setBillType] = useState<BillType>('medical');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<BillAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to scan bills.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.9 });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const handleScan = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const result = await uploadAndAnalyzeBill(imageUri, billType);
      setAnalysis(result);
    } catch (error: any) {
      Alert.alert('Scan Failed', error.message || 'Could not analyze this bill.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispute = () => {
    if (analysis?.bill_id) {
      router.push({ pathname: '/disputes/new', params: { billId: analysis.bill_id } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Bill</Text>
        <Text style={styles.subtitle}>Detect overcharges instantly</Text>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Bill Type</Text>
        <BillTypeSelector selected={billType} onSelect={setBillType} />

        <View style={styles.uploadArea}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>🧾</Text>
              <Text style={styles.placeholderText}>No bill selected</Text>
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

        {imageUri && !analysis && (
          <TouchableOpacity
            style={[styles.scanBtn, loading && styles.scanBtnDisabled]}
            onPress={handleScan}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.scanBtnText}>Analyze Bill</Text>
            )}
          </TouchableOpacity>
        )}

        {analysis && (
          <View style={styles.resultsSection}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Billed</Text>
                <Text style={styles.summaryValue}>${analysis.total_billed.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fair Price</Text>
                <Text style={styles.summaryValueGreen}>${analysis.fair_total.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Potential Savings</Text>
                <Text style={styles.summaryTotalValue}>
                  ${(analysis.total_billed - analysis.fair_total).toFixed(2)}
                </Text>
              </View>
            </View>

            {analysis.overcharges.length > 0 && (
              <>
                <Text style={styles.overchargesTitle}>
                  {analysis.overcharges.length} Overcharge{analysis.overcharges.length > 1 ? 's' : ''} Found
                </Text>
                {analysis.overcharges.map((item, i) => (
                  <OverchargeItem key={i} item={item} />
                ))}
              </>
            )}

            <TouchableOpacity style={styles.disputeBtn} onPress={handleDispute}>
              <Text style={styles.disputeBtnText}>Start Dispute</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdf4' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#16a34a',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#ffffff' },
  subtitle: { fontSize: 13, color: '#bbf7d0', marginTop: 2 },
  content: { flex: 1, padding: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  uploadArea: {
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1fae5',
    borderStyle: 'dashed',
    marginVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderIcon: { fontSize: 44, marginBottom: 8 },
  placeholderText: { fontSize: 13, color: '#94a3b8' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  uploadBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadBtnText: { color: '#16a34a', fontWeight: '600' },
  scanBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanBtnDisabled: { opacity: 0.6 },
  scanBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  resultsSection: { marginBottom: 32 },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  summaryValueGreen: { fontSize: 14, fontWeight: '600', color: '#16a34a' },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 4,
    paddingTop: 10,
  },
  summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  summaryTotalValue: { fontSize: 18, fontWeight: '800', color: '#16a34a' },
  overchargesTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  disputeBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  disputeBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
});
