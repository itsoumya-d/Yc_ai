import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInspectionStore, SeverityLevel, ViolationCategory, Violation } from '../../store/inspection-store';

const SAFETY_YELLOW = '#FFC107';
const ALERT_RED = '#FF3B30';
const ORANGE = '#FF9800';
const GREEN = '#4CAF50';
const DARK_BG = '#1A1E1F';
const CARD_BG = '#242B2E';
const CHARCOAL = '#2D3436';
const TEXT = '#ECEFF1';
const TEXT2 = '#90A4AE';

type CaptureState = 'idle' | 'viewfinder' | 'analyzing' | 'form';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  critical: ALERT_RED,
  high: ORANGE,
  medium: SAFETY_YELLOW,
  low: '#78909C',
};

const OSHA_CATEGORIES: { key: ViolationCategory; label: string; icon: string }[] = [
  { key: 'fall_protection', label: 'Fall Protection', icon: '🪝' },
  { key: 'electrical', label: 'Electrical', icon: '⚡' },
  { key: 'ppe', label: 'PPE', icon: '🦺' },
  { key: 'hazmat', label: 'Hazardous Materials', icon: '☢️' },
  { key: 'equipment', label: 'Equipment', icon: '🏗️' },
  { key: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
  { key: 'fire', label: 'Fire Safety', icon: '🔥' },
  { key: 'other', label: 'Other', icon: '📋' },
];

const AI_SUGGESTIONS: Record<ViolationCategory, { description: string; oshaCode: string; action: string }> = {
  fall_protection: { description: 'Workers at elevation without proper fall protection equipment', oshaCode: '1926.502', action: 'Install guardrails, safety nets, or provide personal fall arrest systems' },
  electrical: { description: 'Electrical hazard detected — exposed wiring or missing GFCI protection', oshaCode: '1926.404', action: 'De-energize circuit, cover exposed conductors, install GFCI protection' },
  ppe: { description: 'Workers lacking required personal protective equipment', oshaCode: '1926.95', action: 'Provide appropriate PPE and enforce usage policy with written documentation' },
  hazmat: { description: 'Hazardous material handling or storage violation detected', oshaCode: '1910.1200', action: 'Review SDS, ensure proper labeling and containment per hazmat guidelines' },
  equipment: { description: 'Equipment deficiency or unsafe operation observed', oshaCode: '1926.300', action: 'Remove equipment from service until repaired and re-inspected by qualified person' },
  housekeeping: { description: 'Housekeeping violation — blocked egress or cluttered workspace', oshaCode: '1926.25', action: 'Clear all egress paths, organize materials, establish daily cleanup schedule' },
  fire: { description: 'Fire safety violation — extinguisher or egress issue', oshaCode: '1910.157', action: 'Replace/recharge extinguisher, clear egress, verify evacuation plan is posted' },
  other: { description: 'Safety violation observed requiring corrective action', oshaCode: 'General Duty Clause', action: 'Document violation, notify supervisor, and establish corrective action timeline' },
};

export default function ScannerScreen() {
  const [captureState, setCaptureState] = useState<CaptureState>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<ViolationCategory | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>('medium');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const { addViolation, inspections } = useInspectionStore();

  const handleCapture = () => {
    Alert.alert(
      'Capture Violation',
      'Point camera at the safety violation. AI will analyze the image and suggest OSHA category and severity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Capture',
          onPress: () => {
            setCaptureState('viewfinder');
            setScanProgress(0);
            let prog = 0;
            const interval = setInterval(() => {
              prog += 20;
              setScanProgress(Math.min(prog, 100));
              if (prog >= 100) {
                clearInterval(interval);
                setCaptureState('analyzing');
                setTimeout(() => {
                  setCaptureState('form');
                }, 2000);
              }
            }, 150);
          },
        },
      ]
    );
  };

  const handleSave = () => {
    if (!selectedCategory || !location) {
      Alert.alert('Missing Info', 'Please select a category and enter the location.');
      return;
    }
    const suggestion = AI_SUGGESTIONS[selectedCategory];
    const newViolation: Violation = {
      id: `v-${Date.now()}`,
      category: selectedCategory,
      severity: selectedSeverity,
      description: suggestion.description + (notes ? ` — ${notes}` : ''),
      oshaCode: suggestion.oshaCode,
      location,
      recommendedAction: suggestion.action,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      corrected: false,
    };
    if (inspections.length > 0) {
      addViolation(inspections[0].id, newViolation);
    }
    Alert.alert('Violation Logged', `${suggestion.description}\n\nSeverity: ${selectedSeverity.toUpperCase()}\nOSHA: ${suggestion.oshaCode}`);
    setCaptureState('idle');
    setSelectedCategory(null);
    setLocation('');
    setNotes('');
  };

  if (captureState === 'viewfinder' || captureState === 'analyzing') {
    return (
      <SafeAreaView style={vf.safe}>
        <View style={vf.screen}>
          <View style={vf.frame}>
            <View style={[vf.corner, vf.tl]} />
            <View style={[vf.corner, vf.tr]} />
            <View style={[vf.corner, vf.bl]} />
            <View style={[vf.corner, vf.br]} />
            {captureState === 'viewfinder' && (
              <View style={[vf.scanLine, { top: `${scanProgress}%` as any }]} />
            )}
            <View style={vf.overlay}>
              <Text style={vf.overlayText}>
                {captureState === 'analyzing' ? '🤖 AI analyzing violation...' : '📸 Capturing violation...'}
              </Text>
            </View>
          </View>

          {captureState === 'viewfinder' && (
            <View style={vf.progress}>
              <View style={vf.progressBar}>
                <View style={[vf.progressFill, { width: `${scanProgress}%` as any }]} />
              </View>
              <Text style={vf.progressText}>Analyzing... {scanProgress}%</Text>
            </View>
          )}

          {captureState === 'analyzing' && (
            <View style={vf.analyzing}>
              <Text style={vf.analyzingText}>🤖 Detecting OSHA violations...</Text>
              <Text style={vf.analyzingText2}>Classifying hazard category and severity</Text>
            </View>
          )}

          <TouchableOpacity style={vf.cancelBtn} onPress={() => setCaptureState('idle')}>
            <Text style={vf.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (captureState === 'form') {
    const suggestion = selectedCategory ? AI_SUGGESTIONS[selectedCategory] : null;

    return (
      <SafeAreaView style={form.safe}>
        <View style={form.header}>
          <TouchableOpacity onPress={() => setCaptureState('idle')}>
            <Ionicons name="close" size={24} color={TEXT} />
          </TouchableOpacity>
          <Text style={form.title}>Log Violation</Text>
          <TouchableOpacity style={form.saveBtn} onPress={handleSave}>
            <Text style={form.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={form.scroll} contentContainerStyle={form.content}>
          {/* AI suggestion card */}
          <View style={form.aiCard}>
            <Ionicons name="sparkles" size={16} color={SAFETY_YELLOW} />
            <Text style={form.aiText}>AI detected: {selectedCategory ? AI_SUGGESTIONS[selectedCategory].description : 'Select a category below'}</Text>
          </View>

          {/* Category */}
          <Text style={form.label}>OSHA Category</Text>
          <View style={form.categoryGrid}>
            {OSHA_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[form.catBtn, selectedCategory === cat.key && form.catBtnActive]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <Text style={form.catIcon}>{cat.icon}</Text>
                <Text style={[form.catLabel, selectedCategory === cat.key && form.catLabelActive]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Severity */}
          <Text style={form.label}>Severity Level</Text>
          <View style={form.sevRow}>
            {(['critical', 'high', 'medium', 'low'] as SeverityLevel[]).map(sev => (
              <TouchableOpacity
                key={sev}
                style={[form.sevBtn, { borderColor: SEVERITY_COLORS[sev] }, selectedSeverity === sev && { backgroundColor: SEVERITY_COLORS[sev] }]}
                onPress={() => setSelectedSeverity(sev)}
              >
                <Text style={[form.sevBtnText, selectedSeverity === sev && { color: CHARCOAL }]}>{sev.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Location */}
          <Text style={form.label}>Location *</Text>
          <TextInput
            style={form.input}
            placeholder="E.g. East wing, 3rd floor"
            placeholderTextColor="#636E72"
            value={location}
            onChangeText={setLocation}
          />

          {/* Notes */}
          <Text style={form.label}>Additional Notes</Text>
          <TextInput
            style={[form.input, form.inputMulti]}
            placeholder="Describe what you observed..."
            placeholderTextColor="#636E72"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          {suggestion && (
            <View style={form.recCard}>
              <Text style={form.recTitle}>Recommended Action</Text>
              <Text style={form.recText}>{suggestion.action}</Text>
              <Text style={form.recOsha}>OSHA {suggestion.oshaCode}</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Start Inspection</Text>
        <Text style={s.sub}>AI-powered OSHA violation detection</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Main capture button */}
        <TouchableOpacity style={s.captureCard} onPress={handleCapture}>
          <View style={s.captureIcon}>
            <Ionicons name="camera" size={48} color={CHARCOAL} />
          </View>
          <Text style={s.captureTitle}>Capture Violation</Text>
          <Text style={s.captureSub}>AI detects OSHA category and severity automatically</Text>
        </TouchableOpacity>

        {/* OSHA reference cards */}
        <Text style={s.sectionTitle}>Common OSHA Categories</Text>
        <View style={s.catGrid}>
          {OSHA_CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.key} style={s.catCard} onPress={() => { setSelectedCategory(cat.key); setCaptureState('form'); }}>
              <Text style={s.catCardIcon}>{cat.icon}</Text>
              <Text style={s.catCardLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* OSHA severity guide */}
        <View style={s.guideCard}>
          <Text style={s.guideTitle}>⚠️ OSHA Severity Guide</Text>
          {[
            { sev: 'Critical', color: ALERT_RED, desc: 'Imminent danger — stop work immediately' },
            { sev: 'High', color: ORANGE, desc: 'Serious harm likely — correct within 24h' },
            { sev: 'Medium', color: SAFETY_YELLOW, desc: 'Significant hazard — correct within 1 week' },
            { sev: 'Low', color: '#78909C', desc: 'Minor risk — correct within 30 days' },
          ].map(g => (
            <View key={g.sev} style={s.guideRow}>
              <View style={[s.guideDot, { backgroundColor: g.color }]} />
              <Text style={[s.guideSev, { color: g.color }]}>{g.sev}:</Text>
              <Text style={s.guideDesc}>{g.desc}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const vf = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#000' },
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, padding: 20 },
  frame: { width: 320, height: 240, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: SAFETY_YELLOW, borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: SAFETY_YELLOW, opacity: 0.8 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10 },
  overlayText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  progress: { width: 320, gap: 8 },
  progressBar: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: SAFETY_YELLOW, borderRadius: 2 },
  progressText: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
  analyzing: { alignItems: 'center', gap: 6 },
  analyzingText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  analyzingText2: { color: '#9CA3AF', fontSize: 12 },
  cancelBtn: { padding: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
});

const form = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#1E272E', borderBottomWidth: 1, borderBottomColor: CHARCOAL },
  title: { fontSize: 16, fontWeight: '700', color: TEXT },
  saveBtn: { backgroundColor: SAFETY_YELLOW, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: CHARCOAL },
  scroll: { flex: 1 },
  content: { padding: 16 },
  aiCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: `${SAFETY_YELLOW}15`, borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: `${SAFETY_YELLOW}40` },
  aiText: { flex: 1, fontSize: 13, color: SAFETY_YELLOW, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: '700', color: TEXT2, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  catBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: CARD_BG, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: CHARCOAL },
  catBtnActive: { borderColor: SAFETY_YELLOW, backgroundColor: `${SAFETY_YELLOW}15` },
  catIcon: { fontSize: 18 },
  catLabel: { fontSize: 12, fontWeight: '600', color: TEXT2 },
  catLabelActive: { color: SAFETY_YELLOW },
  sevRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  sevBtn: { flex: 1, borderRadius: 8, padding: 8, alignItems: 'center', borderWidth: 2 },
  sevBtnText: { fontSize: 11, fontWeight: '800', color: TEXT },
  input: { backgroundColor: CARD_BG, borderRadius: 10, padding: 14, color: TEXT, fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: CHARCOAL },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  recCard: { backgroundColor: `${SAFETY_YELLOW}10`, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: `${SAFETY_YELLOW}30` },
  recTitle: { fontSize: 12, fontWeight: '700', color: SAFETY_YELLOW, marginBottom: 6 },
  recText: { fontSize: 13, color: TEXT, lineHeight: 18, marginBottom: 6 },
  recOsha: { fontSize: 11, color: TEXT2, fontFamily: 'monospace' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK_BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#1E272E', borderBottomWidth: 1, borderBottomColor: CHARCOAL },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  content: { padding: 16 },
  captureCard: { backgroundColor: SAFETY_YELLOW, borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 24 },
  captureIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  captureTitle: { fontSize: 22, fontWeight: '800', color: CHARCOAL, marginBottom: 8 },
  captureSub: { fontSize: 14, color: CHARCOAL, textAlign: 'center', opacity: 0.7 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catCard: { width: '48%', backgroundColor: CARD_BG, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: CHARCOAL },
  catCardIcon: { fontSize: 24, marginBottom: 6 },
  catCardLabel: { fontSize: 13, fontWeight: '600', color: TEXT2 },
  guideCard: { backgroundColor: CARD_BG, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: CHARCOAL },
  guideTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },
  guideRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  guideDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  guideSev: { fontSize: 13, fontWeight: '700', width: 60 },
  guideDesc: { flex: 1, fontSize: 12, color: TEXT2, lineHeight: 17 },
});
