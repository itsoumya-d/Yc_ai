import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '@/constants/theme';
import { analyzeBill, generateDisputeLetter } from '@/services/ai';
import { useClaimsStore } from '@/stores/claims';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof analyzeBill>> | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { addClaim } = useClaimsStore();

  const handleCapture = async () => {
    if (!cameraRef.current || analyzing) return;
    setAnalyzing(true);
    setShowCamera(false);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (!photo?.base64) throw new Error('No image');
      const analysis = await analyzeBill(photo.base64);
      setResult(analysis);
      if (analysis.potentialSavings > 0) {
        const letter = await generateDisputeLetter(analysis, 'Account Holder');
        addClaim({
          id: Date.now().toString(), billType: analysis.billType,
          originalAmount: analysis.totalAmount, potentialSavings: analysis.potentialSavings,
          status: 'pending', disputeLetter: letter, analysis,
          imageUri: photo.uri, createdAt: new Date().toISOString(),
        });
      }
    } catch {
      Alert.alert('Analysis Failed', 'Could not analyze the bill. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 }}>Camera Required</Text>
        <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back">
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 60, alignItems: 'center' }}>
            <Text style={{ color: 'white', marginBottom: 32, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              Position bill in frame
            </Text>
            <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowCamera(false)} style={{ padding: 14, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24 }}>
                <Text style={{ color: 'white' }}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCapture} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'white', borderWidth: 4, borderColor: COLORS.primary }} />
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        {analyzing ? (
          <View style={{ alignItems: 'center', padding: 40, gap: 16 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text }}>Analyzing your bill...</Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>GPT-4o Vision is checking for overcharges and errors</Text>
          </View>
        ) : result ? (
          <>
            <View style={{ backgroundColor: result.potentialSavings > 0 ? COLORS.success + '10' : COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: result.potentialSavings > 0 ? COLORS.success + '40' : COLORS.border }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, textTransform: 'capitalize' }}>
                {result.billType} Bill Analysis
              </Text>
              <Text style={{ fontSize: 36, fontWeight: '900', color: result.potentialSavings > 0 ? COLORS.success : COLORS.textSecondary, marginTop: 8 }}>
                {result.potentialSavings > 0 ? `+$${result.potentialSavings} potential savings` : 'No overcharges found'}
              </Text>
            </View>
            {result.overcharges.map((o, i) => (
              <View key={i} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#FCA5A5' }}>
                <Text style={{ fontWeight: '600', color: COLORS.text }}>{o.item}</Text>
                <Text style={{ color: COLORS.error, marginTop: 4 }}>Charged: ${o.chargedAmount} | Expected: ${o.expectedAmount}</Text>
                <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>{o.issue}</Text>
              </View>
            ))}
            {result.potentialSavings > 0 && (
              <TouchableOpacity style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>📬 Send Dispute Letter</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setResult(null)} style={{ borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Scan Another Bill</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>💰 Scan Your Bill</Text>
              <Text style={{ color: 'white', opacity: 0.85, marginTop: 4 }}>AI detects overcharges in seconds</Text>
            </View>
            {['Medical Bills', 'Utility Bills', 'Insurance Bills', 'Subscription Charges'].map((type) => (
              <View key={type} style={{ backgroundColor: COLORS.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 20 }}>✓</Text>
                <Text style={{ color: COLORS.text }}>{type}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => setShowCamera(true)} style={{ backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>📷 Scan Bill Now</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
