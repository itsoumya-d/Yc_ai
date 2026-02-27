import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useClaimsStore } from '../../store/claims-store';

const BLUE = '#2563EB';
const GREEN = '#10B981';
const ORANGE = '#F97316';
const BG = '#FAFBFC';

type ScanState = 'idle' | 'scanning' | 'analyzing' | 'done';

export default function ScanScreen() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const router = useRouter();
  const { bills } = useClaimsStore();

  const handleScan = () => {
    Alert.alert(
      'Scan Bill',
      'Position your bill within the frame. Claimback will automatically detect edges and capture when aligned.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Scan',
          onPress: () => {
            setScanState('scanning');
            setScanProgress(0);
            let prog = 0;
            const interval = setInterval(() => {
              prog += 15;
              setScanProgress(Math.min(prog, 100));
              if (prog >= 100) {
                clearInterval(interval);
                setScanState('analyzing');
                setTimeout(() => setScanState('done'), 1800);
              }
            }, 150);
          },
        },
      ]
    );
  };

  const billTypes = [
    { type: 'medical', icon: '🏥', label: 'Medical Bill', sub: 'Hospital, doctor, pharmacy' },
    { type: 'utility', icon: '⚡', label: 'Utility Bill', sub: 'Electric, gas, water' },
    { type: 'telecom', icon: '📱', label: 'Phone / Internet', sub: 'Mobile, cable, internet' },
    { type: 'insurance', icon: '🛡️', label: 'Insurance Bill', sub: 'Health, auto, home' },
    { type: 'credit', icon: '💳', label: 'Credit Card', sub: 'Fees, charges, interest' },
    { type: 'other', icon: '📄', label: 'Other Bill', sub: 'Any other overcharge' },
  ];

  if (scanState === 'scanning' || scanState === 'analyzing') {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.scanningScreen}>
          <View style={s.viewfinder}>
            {/* Corner guides */}
            {[0, 1, 2, 3].map(i => (
              <View key={i} style={[s.corner, i === 0 && s.tl, i === 1 && s.tr, i === 2 && s.bl, i === 3 && s.br]} />
            ))}
            {/* Scan line */}
            {scanState === 'scanning' && (
              <View style={[s.scanLine, { top: `${scanProgress}%` as any }]} />
            )}
            <Text style={s.viewfinderText}>
              {scanState === 'scanning' ? 'Scanning document...' : '🤖 AI analyzing overcharges...'}
            </Text>
          </View>

          <View style={s.progressWrap}>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${scanProgress}%` as any }]} />
            </View>
            <Text style={s.progressLabel}>
              {scanState === 'scanning' ? `Capturing... ${scanProgress}%` : 'Detecting overcharges...'}
            </Text>
          </View>

          <TouchableOpacity style={s.cancelBtn} onPress={() => setScanState('idle')}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (scanState === 'done') {
    const sampleBill = bills[0];
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.resultContent} showsVerticalScrollIndicator={false}>
          <View style={s.resultHeader}>
            <View style={s.resultIcon}><Text style={{ fontSize: 32 }}>🎯</Text></View>
            <Text style={s.resultTitle}>Overcharges Found!</Text>
            <Text style={s.resultSub}>{sampleBill.provider} — ${sampleBill.amount.toFixed(2)}</Text>
          </View>

          <View style={s.foundCard}>
            <Text style={s.foundLabel}>Total Overcharge Detected</Text>
            <Text style={s.foundAmt}>${sampleBill.totalOvercharge.toFixed(2)}</Text>
            <Text style={s.foundSub}>{sampleBill.lineItems.filter(l => l.isOvercharge).length} billing issues found</Text>
          </View>

          {sampleBill.lineItems.filter(l => l.isOvercharge).map((item, i) => (
            <View key={i} style={s.lineItem}>
              <View style={s.lineItemLeft}>
                <Text style={s.lineDesc}>{item.description}</Text>
                <Text style={s.lineType}>{item.overchargeType?.replace('_', ' ')}</Text>
              </View>
              <View style={s.lineRight}>
                <Text style={s.lineExpected}>${item.expected.toFixed(2)} expected</Text>
                <Text style={s.lineCharged}>${item.charged.toFixed(2)} charged</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={s.disputeBtn} onPress={() => { setScanState('idle'); router.push('/(tabs)/disputes'); }}>
            <Text style={s.disputeBtnText}>Dispute These Charges →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.scanAgainBtn} onPress={() => setScanState('idle')}>
            <Text style={s.scanAgainText}>Scan Another Bill</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Scan a Bill</Text>
        <Text style={s.sub}>We'll find overcharges in seconds</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Main Scan Button */}
        <TouchableOpacity style={s.mainScanCard} onPress={handleScan}>
          <View style={s.cameraIcon}><Ionicons name="camera" size={48} color={BLUE} /></View>
          <Text style={s.mainScanTitle}>Open Camera</Text>
          <Text style={s.mainScanSub}>Point at any bill — AI reads and analyzes it automatically</Text>
        </TouchableOpacity>

        <View style={s.orRow}>
          <View style={s.orLine} />
          <Text style={s.orText}>or choose bill type</Text>
          <View style={s.orLine} />
        </View>

        {/* Bill type grid */}
        <View style={s.typeGrid}>
          {billTypes.map(bt => (
            <TouchableOpacity key={bt.type} style={s.typeCard} onPress={handleScan}>
              <Text style={s.typeIcon}>{bt.icon}</Text>
              <Text style={s.typeLabel}>{bt.label}</Text>
              <Text style={s.typeSub}>{bt.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={s.tips}>
          <Text style={s.tipsTitle}>📸 Tips for best results</Text>
          {['Lay the bill flat on a surface', 'Ensure good lighting — no shadows', 'Capture the full page including totals', 'Works with photos from your camera roll too'].map(tip => (
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  sub: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  content: { padding: 20 },
  mainScanCard: { backgroundColor: '#EFF6FF', borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: '#BFDBFE', borderStyle: 'dashed', marginBottom: 24 },
  cameraIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  mainScanTitle: { fontSize: 20, fontWeight: '800', color: '#1E3A8A', marginBottom: 8 },
  mainScanSub: { fontSize: 14, color: '#3B82F6', textAlign: 'center', lineHeight: 20 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  typeCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  typeIcon: { fontSize: 28, marginBottom: 8 },
  typeLabel: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  typeSub: { fontSize: 12, color: '#6B7280' },
  tips: { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#BBF7D0' },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN },
  tipText: { fontSize: 13, color: '#065F46' },
  // Scanning screen
  scanningScreen: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', gap: 32 },
  viewfinder: { width: 300, height: 380, borderRadius: 12, position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: ORANGE },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: BLUE, opacity: 0.8 },
  viewfinderText: { position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 14, fontWeight: '600' },
  progressWrap: { width: 300, gap: 8 },
  progressBar: { height: 4, backgroundColor: '#374151', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: BLUE, borderRadius: 2 },
  progressLabel: { color: '#9CA3AF', fontSize: 13, textAlign: 'center' },
  cancelBtn: { padding: 16 },
  cancelText: { color: '#9CA3AF', fontSize: 16 },
  // Result screen
  resultContent: { padding: 24 },
  resultHeader: { alignItems: 'center', marginBottom: 24 },
  resultIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  resultSub: { fontSize: 14, color: '#6B7280' },
  foundCard: { backgroundColor: '#ECFDF5', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#A7F3D0' },
  foundLabel: { fontSize: 13, color: '#065F46', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  foundAmt: { fontSize: 48, fontWeight: '800', color: GREEN, lineHeight: 56, marginVertical: 4 },
  foundSub: { fontSize: 14, color: '#065F46' },
  lineItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderWidth: 1, borderLeftWidth: 3, borderLeftColor: ORANGE, borderColor: '#E5E7EB' },
  lineItemLeft: { flex: 1 },
  lineDesc: { fontSize: 14, fontWeight: '600', color: '#111827' },
  lineType: { fontSize: 12, color: ORANGE, textTransform: 'capitalize', marginTop: 2 },
  lineRight: { alignItems: 'flex-end' },
  lineExpected: { fontSize: 12, color: GREEN, fontWeight: '600' },
  lineCharged: { fontSize: 14, fontWeight: '700', color: '#DC2626' },
  disputeBtn: { backgroundColor: BLUE, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  disputeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  scanAgainBtn: { padding: 14, alignItems: 'center' },
  scanAgainText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },
});
