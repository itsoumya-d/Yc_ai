import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { uploadPhoto } from "@/lib/actions/photos";
import { analyzePhoto } from "@/lib/actions/ai";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const PHASES = [
  "Foundation",
  "Framing",
  "Roofing",
  "MEP Rough-in",
  "Insulation",
  "Drywall",
  "Finishes",
  "Landscaping",
  "General",
];

export default function CaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState("General");
  const [notes, setNotes] = useState("");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    phase?: string;
    violations?: string[];
    progressNotes?: string;
    confidence?: number;
  } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      await getLocation();
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
      });
      if (photo) {
        setCapturedUri(photo.uri);
        if (photo.base64) {
          setAnalyzing(true);
          const result = await analyzePhoto(photo.base64);
          setAnalysis(result);
          if (result?.phase) setSelectedPhase(result.phase);
          setAnalyzing(false);
        }
      }
    } catch (err) {
      Alert.alert("Error", "Failed to capture photo");
    }
    setCapturing(false);
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setCapturedUri(asset.uri);
      if (asset.base64) {
        setAnalyzing(true);
        await getLocation();
        const analysisResult = await analyzePhoto(asset.base64);
        setAnalysis(analysisResult);
        if (analysisResult?.phase) setSelectedPhase(analysisResult.phase);
        setAnalyzing(false);
      }
    }
  };

  const savePhoto = async () => {
    if (!capturedUri) return;
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Not authenticated");
      setUploading(false);
      return;
    }

    const { data, error } = await uploadPhoto({
      userId: user.id,
      localUri: capturedUri,
      phase: selectedPhase,
      notes,
      lat: location?.lat,
      lng: location?.lng,
      aiAnalysis: analysis,
    });

    if (error) {
      Alert.alert("Error", error);
    } else {
      Alert.alert("Saved!", "Photo uploaded and analyzed.", [
        { text: "OK", onPress: () => { setCapturedUri(null); setAnalysis(null); setNotes(""); } },
      ]);
    }
    setUploading(false);
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          SiteSync needs camera access to capture job site photos.
        </Text>
        <Button label="Grant Permission" onPress={requestPermission} />
      </SafeAreaView>
    );
  }

  if (capturedUri) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Review Photo</Text>

          {/* AI Analysis */}
          {analyzing ? (
            <Card style={styles.analysisCard}>
              <ActivityIndicator color="#d97706" />
              <Text style={styles.analyzingText}>AI analyzing photo...</Text>
            </Card>
          ) : analysis ? (
            <Card style={[styles.analysisCard, analysis.violations && analysis.violations.length > 0 && styles.analysisCardDanger]}>
              <Text style={styles.analysisTitle}>AI Analysis</Text>
              {analysis.phase && (
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Phase detected:</Text>
                  <Badge label={analysis.phase} variant="warning" />
                </View>
              )}
              {analysis.progressNotes && (
                <Text style={styles.analysisNotes}>{analysis.progressNotes}</Text>
              )}
              {analysis.violations && analysis.violations.length > 0 && (
                <View style={styles.violationsSection}>
                  <Text style={styles.violationsTitle}>⚠ Safety Violations Detected:</Text>
                  {analysis.violations.map((v, i) => (
                    <Text key={i} style={styles.violationItem}>• {v}</Text>
                  ))}
                </View>
              )}
              {(!analysis.violations || analysis.violations.length === 0) && (
                <Text style={styles.safeText}>✓ No safety violations detected</Text>
              )}
            </Card>
          ) : null}

          {/* Phase Selection */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Construction Phase</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.phaseRow}>
                {PHASES.map((phase) => (
                  <TouchableOpacity
                    key={phase}
                    style={[
                      styles.phaseChip,
                      selectedPhase === phase && styles.phaseChipActive,
                    ]}
                    onPress={() => setSelectedPhase(phase)}
                  >
                    <Text
                      style={[
                        styles.phaseChipText,
                        selectedPhase === phase && styles.phaseChipTextActive,
                      ]}
                    >
                      {phase}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Location */}
          {location && (
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>
                📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </Text>
            </View>
          )}

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this photo..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              label="Save Photo"
              onPress={savePhoto}
              loading={uploading}
              style={styles.saveBtn}
            />
            <Button
              label="Retake"
              onPress={() => { setCapturedUri(null); setAnalysis(null); }}
              variant="secondary"
              style={styles.retakeBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Phase Overlay */}
      <SafeAreaView style={styles.topOverlay} edges={["top"]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.phaseRow}>
            {PHASES.map((phase) => (
              <TouchableOpacity
                key={phase}
                style={[
                  styles.phasePill,
                  selectedPhase === phase && styles.phasePillActive,
                ]}
                onPress={() => setSelectedPhase(phase)}
              >
                <Text style={[styles.phasePillText, selectedPhase === phase && styles.phasePillTextActive]}>
                  {phase}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Capture Controls */}
      <View style={styles.cameraControls}>
        <TouchableOpacity style={styles.galleryBtn} onPress={pickFromLibrary}>
          <Text style={styles.galleryBtnText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={capturePhoto}
          disabled={capturing}
        >
          {capturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </TouchableOpacity>

        <View style={{ width: 70 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fffbf0" },
  scroll: { padding: 16, paddingBottom: 32 },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fffbf0",
  },
  permissionTitle: { fontSize: 20, fontWeight: "700", color: "#1c1917", marginBottom: 8 },
  permissionText: { fontSize: 14, color: "#78716c", textAlign: "center", marginBottom: 24 },
  title: { fontSize: 22, fontWeight: "800", color: "#1c1917", marginBottom: 16 },
  analysisCard: {
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#fefce8",
    borderColor: "#fde047",
  },
  analysisCardDanger: { backgroundColor: "#fef2f2", borderColor: "#fca5a5" },
  analysisTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 8 },
  analyzingText: { fontSize: 13, color: "#78716c", textAlign: "center", marginTop: 8 },
  analysisRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  analysisLabel: { fontSize: 13, color: "#374151" },
  analysisNotes: { fontSize: 13, color: "#374151", lineHeight: 18 },
  violationsSection: { marginTop: 8, padding: 8, backgroundColor: "#fee2e2", borderRadius: 8 },
  violationsTitle: { fontSize: 13, fontWeight: "700", color: "#dc2626", marginBottom: 4 },
  violationItem: { fontSize: 13, color: "#7f1d1d", lineHeight: 20 },
  safeText: { fontSize: 13, color: "#16a34a", fontWeight: "600", marginTop: 4 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  phaseRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  phaseChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#e7e5e4",
    backgroundColor: "#fff",
  },
  phaseChipActive: { borderColor: "#d97706", backgroundColor: "#fef3c7" },
  phaseChipText: { fontSize: 13, color: "#78716c", fontWeight: "600" },
  phaseChipTextActive: { color: "#d97706" },
  locationRow: { marginBottom: 12 },
  locationText: { fontSize: 12, color: "#78716c" },
  notesInput: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e7e5e4",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1c1917",
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  saveBtn: { flex: 1, backgroundColor: "#d97706" },
  retakeBtn: { flex: 1 },
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  topOverlay: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 12, paddingTop: 8 },
  phasePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  phasePillActive: { backgroundColor: "#d97706", borderColor: "#d97706" },
  phasePillText: { fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: "600" },
  phasePillTextActive: { color: "#fff" },
  cameraControls: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  galleryBtn: {
    width: 70,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  galleryBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
  },
});
