import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSkinStore } from '@/stores/skin';
import { COLORS, RISK_COLORS } from '@/constants/theme';
import { analyzeSkinPhoto } from '@/services/ai';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof analyzeSkinPhoto>> | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { spots, addPhoto } = useSkinStore();

  const handleCapture = async () => {
    if (!cameraRef.current || analyzing) return;
    setAnalyzing(true);
    setShowCamera(false);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.9 });
      if (!photo?.base64) throw new Error('No image');
      const analysis = await analyzeSkinPhoto(photo.base64);
      setResult(analysis);
      if (selectedSpotId) {
        addPhoto(selectedSpotId, { id: Date.now().toString(), imageUri: photo.uri, analysis, capturedAt: new Date().toISOString() });
      }
    } catch {
      Alert.alert('Analysis Failed', 'Could not analyze the photo. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 }}>Camera Access Required</Text>
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
          <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 60, alignItems: 'center', gap: 16 }}>
            <View style={{ width: 220, height: 220, borderRadius: 110, borderWidth: 2, borderColor: 'white', backgroundColor: 'transparent' }} />
            <Text style={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              Center the skin area in the circle
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
          <View style={{ alignItems: 'center', padding: 48, gap: 16 }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text }}>Analyzing skin photo...</Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: 'center' }}>GPT-4o Vision is applying ABCDE criteria</Text>
          </View>
        ) : result ? (
          <>
            <View style={{
              backgroundColor: RISK_COLORS[result.riskLevel] + '10',
              borderRadius: 16, padding: 20, borderWidth: 1,
              borderColor: RISK_COLORS[result.riskLevel] + '40',
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>Analysis Result</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: RISK_COLORS[result.riskLevel] }} />
                <Text style={{ fontSize: 22, fontWeight: '800', color: RISK_COLORS[result.riskLevel], textTransform: 'uppercase' }}>
                  {result.riskLevel} Risk
                </Text>
              </View>
              <Text style={{ color: COLORS.text, marginTop: 8, lineHeight: 20 }}>{result.recommendation}</Text>
            </View>

            {/* ABCDE breakdown */}
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>ABCDE Analysis</Text>
            {Object.entries(result.abcdeCriteria).map(([key, val]) => (
              <View key={key} style={{ backgroundColor: COLORS.card, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: COLORS.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', color: COLORS.text, textTransform: 'uppercase', fontSize: 14 }}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <Text style={{ fontWeight: '700', color: val.score > 1 ? COLORS.warning : COLORS.success }}>{val.score}/3</Text>
                </View>
                <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>{val.note}</Text>
              </View>
            ))}

            {result.shouldSeeDoctor && (
              <TouchableOpacity style={{ backgroundColor: COLORS.error, borderRadius: 12, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>🏥 Find a Dermatologist</Text>
              </TouchableOpacity>
            )}

            <View style={{ backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FED7AA' }}>
              <Text style={{ fontSize: 12, color: '#92400E' }}>{result.disclaimer}</Text>
            </View>

            <TouchableOpacity onPress={() => setResult(null)} style={{ borderWidth: 1, borderColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Scan Another</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 }}>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>🔬 Skin Scan</Text>
              <Text style={{ color: 'white', opacity: 0.85, marginTop: 4 }}>ABCDE criteria analysis</Text>
            </View>

            {spots.length > 0 && (
              <>
                <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}>Link to a tracked spot (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => setSelectedSpotId(null)} style={{
                      backgroundColor: !selectedSpotId ? COLORS.primary : COLORS.card,
                      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
                      borderWidth: 1, borderColor: !selectedSpotId ? COLORS.primary : COLORS.border,
                    }}>
                      <Text style={{ color: !selectedSpotId ? 'white' : COLORS.text }}>No spot</Text>
                    </TouchableOpacity>
                    {spots.map((s) => (
                      <TouchableOpacity key={s.id} onPress={() => setSelectedSpotId(s.id)} style={{
                        backgroundColor: selectedSpotId === s.id ? COLORS.primary : COLORS.card,
                        borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
                        borderWidth: 1, borderColor: selectedSpotId === s.id ? COLORS.primary : COLORS.border,
                      }}>
                        <Text style={{ color: selectedSpotId === s.id ? 'white' : COLORS.text }}>{s.nickname}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}

            <TouchableOpacity onPress={() => setShowCamera(true)} style={{ backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 20, alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 36 }}>📷</Text>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Take Photo</Text>
              <Text style={{ color: 'white', opacity: 0.8, fontSize: 13 }}>Good lighting, close-up, in focus</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
