import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { extractDocumentData } from '@/services/ai';
import { useDocumentStore } from '@/stores/documents';

const DOC_TYPES = ['ID / License', 'Tax Form', 'Pay Stub', 'Other'];

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedType, setSelectedType] = useState(0);
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { addDocument } = useDocumentStore();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { padding: 32, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 16 }}>
          Camera Permission Required
        </Text>
        <Text style={{ textAlign: 'center', color: COLORS.textSecondary, marginBottom: 24 }}>
          GovPass needs camera access to scan your documents.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || scanning) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (!photo?.base64) throw new Error('No image data');

      const docTypeNames = ['drivers_license', 'tax_form', 'pay_stub', 'other'];
      const result = await extractDocumentData(photo.base64, docTypeNames[selectedType]);

      addDocument({
        id: Date.now().toString(),
        type: DOC_TYPES[selectedType],
        fields: result.fields,
        scannedAt: new Date().toISOString(),
        imageUri: photo.uri,
      });

      Alert.alert(
        'Document Scanned',
        `Successfully extracted ${Object.keys(result.fields).length} fields from your document.`,
        [{ text: 'View Results', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Scan Failed', 'Could not read the document. Please try again with better lighting.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back">
        {/* Alignment overlay */}
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.instruction}>
            {scanning ? 'Analyzing document...' : 'Position document inside the frame'}
          </Text>
        </View>
      </CameraView>

      {/* Document type selector */}
      <View style={styles.typeSelector}>
        {DOC_TYPES.map((type, index) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(index)}
            style={[styles.typeChip, selectedType === index && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, selectedType === index && styles.typeChipTextActive]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Capture button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          onPress={handleCapture}
          disabled={scanning}
          style={[styles.captureButton, scanning && { opacity: 0.5 }]}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 300, height: 200,
    borderWidth: 2, borderColor: 'white', borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instruction: {
    color: 'white', marginTop: 16, fontSize: 15,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  typeSelector: {
    position: 'absolute', bottom: 120, left: 16, right: 16,
    flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
  },
  typeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
  },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { color: 'white', fontSize: 13 },
  typeChipTextActive: { fontWeight: '600' },
  captureContainer: {
    position: 'absolute', bottom: 48, alignSelf: 'center',
  },
  captureButton: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 3, borderColor: 'white',
    alignItems: 'center', justifyContent: 'center',
  },
  captureButtonInner: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: 'white',
  },
});
