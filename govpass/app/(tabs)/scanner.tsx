import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CIVIC_BLUE = '#1E40AF';
const CIVIC_GREEN = '#059669';
const AMBER = '#D97706';
const BG = '#F9FAFB';

type ScanState = 'idle' | 'scanning' | 'analyzing' | 'done';

const DOC_TYPES = [
  { id: 'id', icon: '🪪', label: 'Government ID', labelEs: 'Identificación', desc: "Driver's license, state ID, passport" },
  { id: 'income', icon: '💵', label: 'Income Proof', labelEs: 'Comprobante de ingresos', desc: 'Pay stubs, tax returns, W-2' },
  { id: 'residency', icon: '🏠', label: 'Proof of Residency', labelEs: 'Prueba de residencia', desc: 'Utility bill, lease agreement' },
  { id: 'birth', icon: '📄', label: 'Birth Certificate', labelEs: 'Acta de nacimiento', desc: 'For all household members' },
  { id: 'social', icon: '🔢', label: 'Social Security Card', labelEs: 'Tarjeta de Seguro Social', desc: 'SSN for all household members' },
  { id: 'medical', icon: '🏥', label: 'Medical Records', labelEs: 'Registros médicos', desc: 'For disability or healthcare programs' },
];

const SCAN_RESULTS = {
  name: 'John A. Rodriguez',
  dob: '1985-03-14',
  documentType: 'California Driver License',
  expiresAt: '2028-03-14',
  address: '1234 Main St, San Jose, CA 95101',
  docNumber: 'D9876543',
};

export default function ScannerScreen() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [progress, setProgress] = useState(0);
  const [alignScore, setAlignScore] = useState(0);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);

  const startScan = (docType: string) => {
    setSelectedDocType(docType);
    Alert.alert(
      'Scan Document',
      'Position your document within the frame. GovPass will automatically detect edges when aligned.\n\nPosicione su documento dentro del marco.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Scan',
          onPress: () => {
            setScanState('scanning');
            setProgress(0);
            setAlignScore(0);

            let prog = 0;
            let align = 0;
            const interval = setInterval(() => {
              prog += 12;
              align = Math.min(100, align + 25);
              setProgress(Math.min(prog, 100));
              setAlignScore(align);
              if (prog >= 100) {
                clearInterval(interval);
                setScanState('analyzing');
                setTimeout(() => setScanState('done'), 2000);
              }
            }, 180);
          },
        },
      ]
    );
  };

  if (scanState === 'scanning' || scanState === 'analyzing') {
    const isAligned = alignScore >= 80;

    return (
      <SafeAreaView style={scan.safe}>
        <View style={scan.screen}>
          {/* Viewfinder */}
          <View style={scan.frame}>
            {/* Corner guides */}
            <View style={[scan.corner, scan.tl, { borderColor: isAligned ? CIVIC_GREEN : AMBER }]} />
            <View style={[scan.corner, scan.tr, { borderColor: isAligned ? CIVIC_GREEN : AMBER }]} />
            <View style={[scan.corner, scan.bl, { borderColor: isAligned ? CIVIC_GREEN : AMBER }]} />
            <View style={[scan.corner, scan.br, { borderColor: isAligned ? CIVIC_GREEN : AMBER }]} />

            {/* Scan line */}
            {scanState === 'scanning' && (
              <View style={[scan.scanLine, { top: `${progress}%` as any, backgroundColor: isAligned ? CIVIC_GREEN : AMBER }]} />
            )}

            {/* Status text */}
            <View style={scan.overlay}>
              <Text style={scan.overlayText}>
                {scanState === 'analyzing' ? '🤖 Extracting information...' :
                  isAligned ? '✅ Document aligned — hold still' : '📐 Align document with frame'}
              </Text>
            </View>
          </View>

          {/* Alignment indicator */}
          <View style={scan.alignBar}>
            <Text style={scan.alignLabel}>Alignment / Alineación</Text>
            <View style={scan.alignTrack}>
              <View style={[scan.alignFill, { width: `${alignScore}%` as any, backgroundColor: isAligned ? CIVIC_GREEN : AMBER }]} />
            </View>
            <Text style={[scan.alignPct, { color: isAligned ? CIVIC_GREEN : AMBER }]}>{alignScore}%</Text>
          </View>

          {scanState === 'scanning' && (
            <View style={scan.progressWrap}>
              <View style={scan.progressBar}>
                <View style={[scan.progressFill, { width: `${progress}%` as any }]} />
              </View>
              <Text style={scan.progressText}>Scanning... {progress}%</Text>
            </View>
          )}

          {scanState === 'analyzing' && (
            <View style={scan.analyzingWrap}>
              <Ionicons name="sparkles" size={24} color={CIVIC_GREEN} />
              <Text style={scan.analyzingText}>AI is reading your document...</Text>
              <Text style={scan.analyzingTextEs}>La IA está leyendo su documento...</Text>
            </View>
          )}

          <TouchableOpacity style={scan.cancelBtn} onPress={() => setScanState('idle')}>
            <Text style={scan.cancelText}>Cancel / Cancelar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (scanState === 'done') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
        <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
          <View style={res.header}>
            <View style={res.iconWrap}><Text style={{ fontSize: 32 }}>✅</Text></View>
            <Text style={res.title}>Document Scanned!</Text>
            <Text style={res.titleEs}>¡Documento escaneado!</Text>
            <Text style={res.sub}>{DOC_TYPES.find(d => d.id === selectedDocType)?.label}</Text>
          </View>

          <View style={res.card}>
            <Text style={res.cardTitle}>Extracted Information / Información extraída</Text>
            {Object.entries(SCAN_RESULTS).map(([key, val]) => (
              <View key={key} style={res.row}>
                <Text style={res.key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Text>
                <Text style={res.val}>{val}</Text>
              </View>
            ))}
          </View>

          <View style={res.note}>
            <Ionicons name="lock-closed" size={16} color={CIVIC_BLUE} />
            <Text style={res.noteText}>Stored securely. Used only for benefit applications. / Almacenado de forma segura. Usado solo para solicitudes.</Text>
          </View>

          <TouchableOpacity style={res.saveBtn} onPress={() => { Alert.alert('Saved!', 'Document saved to your profile. / Documento guardado en su perfil.'); setScanState('idle'); }}>
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={res.saveBtnText}>Save to Profile / Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={res.scanAgain} onPress={() => setScanState('idle')}>
            <Text style={res.scanAgainText}>Scan Another / Escanear otro</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Document Scanner</Text>
        <Text style={s.titleEs}>Escáner de documentos</Text>
        <Text style={s.sub}>Scan documents to auto-fill your applications.</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.infoCard}>
          <Ionicons name="shield-checkmark" size={20} color={CIVIC_BLUE} />
          <Text style={s.infoText}>
            Your documents are scanned on your device and never uploaded without permission. AI extracts key fields automatically.
          </Text>
        </View>

        <Text style={s.sectionTitle}>Select Document Type / Tipo de documento</Text>

        {DOC_TYPES.map(doc => (
          <TouchableOpacity key={doc.id} style={s.docCard} onPress={() => startScan(doc.id)}>
            <Text style={s.docIcon}>{doc.icon}</Text>
            <View style={s.docInfo}>
              <Text style={s.docLabel}>{doc.label}</Text>
              <Text style={s.docLabelEs}>{doc.labelEs}</Text>
              <Text style={s.docDesc}>{doc.desc}</Text>
            </View>
            <Ionicons name="camera-outline" size={20} color={CIVIC_BLUE} />
          </TouchableOpacity>
        ))}

        <View style={s.tipsCard}>
          <Text style={s.tipsTitle}>📷 Tips / Consejos</Text>
          {[
            'Lay flat on a contrasting surface / Colocar en superficie contrastante',
            'Ensure all text is visible / Asegúrese de que todo el texto sea visible',
            'Use good lighting — avoid glare / Use buena iluminación',
            'Hold still until the frame turns green / No se mueva hasta que el marco se ponga verde',
          ].map(tip => (
            <View key={tip} style={s.tipRow}>
              <View style={s.tipDot} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const scan = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#111827' },
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 20 },
  frame: { width: 320, height: 220, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 24, height: 24, borderWidth: 3 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, opacity: 0.8 },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 },
  overlayText: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  alignBar: { width: 320, flexDirection: 'row', alignItems: 'center', gap: 10 },
  alignLabel: { fontSize: 12, color: '#9CA3AF', width: 80 },
  alignTrack: { flex: 1, height: 6, backgroundColor: '#374151', borderRadius: 3, overflow: 'hidden' },
  alignFill: { height: '100%', borderRadius: 3 },
  alignPct: { fontSize: 12, fontWeight: '700', width: 32, textAlign: 'right' },
  progressWrap: { width: 320, gap: 8 },
  progressBar: { height: 4, backgroundColor: '#374151', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: CIVIC_BLUE, borderRadius: 2 },
  progressText: { color: '#9CA3AF', fontSize: 12, textAlign: 'center' },
  analyzingWrap: { alignItems: 'center', gap: 8 },
  analyzingText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  analyzingTextEs: { color: '#9CA3AF', fontSize: 12 },
  cancelBtn: { padding: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 15 },
});

const res = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 24 },
  iconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  titleEs: { fontSize: 14, color: '#6B7280', marginTop: 2, marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  key: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  val: { fontSize: 13, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  noteText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 17 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: CIVIC_BLUE, borderRadius: 14, padding: 16, justifyContent: 'center', marginBottom: 10 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  scanAgain: { padding: 14, alignItems: 'center' },
  scanAgainText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  titleEs: { fontSize: 13, color: '#6B7280' },
  sub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  docCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  docIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  docInfo: { flex: 1 },
  docLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  docLabelEs: { fontSize: 12, color: '#6B7280' },
  docDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  tipsCard: { backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#BBF7D0' },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CIVIC_GREEN, marginTop: 6 },
  tipText: { flex: 1, fontSize: 12, color: '#065F46', lineHeight: 18 },
});
