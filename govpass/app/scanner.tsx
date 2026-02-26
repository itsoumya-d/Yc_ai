import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permContainer}>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permDesc}>GovPass needs camera access to scan your government documents.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current || scanning) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, base64: false });
      // In production: send to OpenAI Vision for document extraction
      setTimeout(() => {
        setDetected("Driver's License");
        setScanning(false);
        Alert.alert(
          'Document Detected',
          "Driver's License recognized. Extracting information...",
          [{ text: 'Done', onPress: () => router.back() }]
        );
      }, 2000);
    } catch {
      setScanning(false);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanArea}>
              {/* Corner brackets */}
              {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos, i) => (
                <View key={i} style={[styles.corner, pos as object]} />
              ))}
              {scanning && (
                <View style={styles.scanLine} />
              )}
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.hint}>
              {scanning ? '🔍 Analyzing document...' : detected ? `✅ ${detected} detected` : '📄 Position document within the frame'}
            </Text>
            <View style={styles.docTypes}>
              {["Driver's License", 'Passport', 'Tax Form (W-2)', 'Pay Stub', 'Social Security Card'].map((type) => (
                <View key={type} style={styles.docTypePill}>
                  <Text style={styles.docTypeText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </CameraView>

      {/* Capture button */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.captureBtn, scanning && styles.captureBtnScanning]}
          onPress={handleCapture}
          disabled={scanning}
        >
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>
        <View style={{ width: 72 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  overlayMiddle: { flexDirection: 'row', height: 200 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  scanArea: { width: 300, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#1B4EDE', borderWidth: 3 },
  scanLine: { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, backgroundColor: '#1B4EDE', opacity: 0.8 },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', padding: 20, alignItems: 'center' },
  hint: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  docTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  docTypePill: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  docTypeText: { color: '#fff', fontSize: 11 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 32, backgroundColor: '#000' },
  cancelBtn: { width: 72, alignItems: 'center' },
  cancelText: { color: '#fff', fontSize: 16 },
  captureBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1B4EDE', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  captureBtnScanning: { backgroundColor: '#93C5FD' },
  captureBtnInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff' },
  permContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F8FAFC' },
  permTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  permDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  permBtn: { backgroundColor: '#1B4EDE', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
