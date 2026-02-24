import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS, TRADES } from '@/constants/theme';
import { useCoachingStore } from '@/stores/coaching';
import { analyzeJobScene } from '@/services/ai';

export default function CoachScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { selectedTrade, setTrade, currentGuidance, setGuidance, isAnalyzing, setAnalyzing, addToHistory } = useCoachingStore();

  const tradeInfo = TRADES.find((t) => t.id === selectedTrade) ?? TRADES[4];

  const handleCapture = async () => {
    if (!cameraRef.current || isAnalyzing) return;
    setAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
      if (!photo?.base64) throw new Error('No image');
      const guidance = await analyzeJobScene(photo.base64, selectedTrade);
      setGuidance(guidance);
      addToHistory(guidance, photo.uri);
      setShowCamera(false);
    } catch (e) {
      Alert.alert('Analysis Failed', 'Could not analyze the scene. Check your internet connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>Camera Required</Text>
        <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 }}>FieldLens needs camera access to provide AI coaching.</Text>
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
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 60 }}>
            <Text style={{ color: 'white', marginBottom: 32, fontSize: 15, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
              {isAnalyzing ? '🤖 Analyzing...' : `Coaching as ${tradeInfo.label}`}
            </Text>
            <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowCamera(false)} style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24 }}>
                <Text style={{ color: 'white', fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCapture} disabled={isAnalyzing} style={{
                width: 72, height: 72, borderRadius: 36, backgroundColor: isAnalyzing ? COLORS.textMuted : 'white',
                borderWidth: 4, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 24 }}>{isAnalyzing ? '⏳' : '📷'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* Header */}
        <View style={{ backgroundColor: COLORS.primary, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>
            {tradeInfo.icon} FieldLens AI Coach
          </Text>
          <Text style={{ color: 'white', opacity: 0.9, marginTop: 4 }}>
            Instant guidance for {tradeInfo.label}s
          </Text>
        </View>

        {/* Trade selector */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>Select Your Trade</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TRADES.map((trade) => (
            <TouchableOpacity
              key={trade.id}
              onPress={() => setTrade(trade.id)}
              style={{
                backgroundColor: selectedTrade === trade.id ? COLORS.primary : COLORS.card,
                borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
                borderWidth: 1.5, borderColor: selectedTrade === trade.id ? COLORS.primary : COLORS.border,
                flexDirection: 'row', alignItems: 'center', gap: 6,
              }}
            >
              <Text>{trade.icon}</Text>
              <Text style={{ color: selectedTrade === trade.id ? 'white' : COLORS.text, fontWeight: '600', fontSize: 13 }}>
                {trade.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Capture button */}
        <TouchableOpacity
          onPress={() => setShowCamera(true)}
          style={{
            backgroundColor: COLORS.primary, borderRadius: 16, padding: 24,
            alignItems: 'center', gap: 8,
          }}
        >
          <Text style={{ fontSize: 40 }}>📷</Text>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Get AI Coaching</Text>
          <Text style={{ color: 'white', opacity: 0.85, fontSize: 13 }}>Point camera at your work for instant guidance</Text>
        </TouchableOpacity>

        {/* Last guidance */}
        {currentGuidance && (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 }}>
              {currentGuidance.title}
            </Text>
            {currentGuidance.warnings.map((w, i) => (
              <View key={i} style={{ backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10, marginBottom: 8, flexDirection: 'row', gap: 8 }}>
                <Text>⚠️</Text>
                <Text style={{ color: '#92400E', flex: 1, fontSize: 13 }}>{w}</Text>
              </View>
            ))}
            {currentGuidance.steps.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, color: COLORS.text, lineHeight: 20 }}>{step}</Text>
              </View>
            ))}
            <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: currentGuidance.confidence > 0.7 ? COLORS.success : COLORS.warning }} />
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                {Math.round(currentGuidance.confidence * 100)}% confidence
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
