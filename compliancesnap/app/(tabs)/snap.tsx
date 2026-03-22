import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SnapScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={s.header}><Text style={s.title}>Snap</Text></View>
      <View style={s.vf}>
        <View style={s.vfInner}>
          <Ionicons name="camera" size={48} color="#F59E0B" />
          <Text style={s.vfText}>Tap to Capture</Text>
          <Text style={s.vfSub}>Point camera at the subject</Text>
        </View>
        <View style={s.cTL} /><View style={s.cTR} /><View style={s.cBL} /><View style={s.cBR} />
      </View>
      <TouchableOpacity style={s.capBtn} onPress={() => Alert.alert('Snap', 'Camera requires a physical device!')}>
        <Ionicons name="camera" size={28} color="#FFFFFF" />
        <Text style={s.capText}>Capture</Text>
      </TouchableOpacity>
      <Text style={s.recentLabel}>Recent Captures</Text>
      {[1, 2, 3].map((i) => (
        <TouchableOpacity key={i} style={s.recentItem}>
          <View style={s.recentThumb}><Ionicons name="image" size={20} color="#F59E0B" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.recentTitle}>Capture {i}</Text>
            <Text style={s.recentSub}>{i === 1 ? 'Just now' : i === 2 ? '1 hour ago' : 'Yesterday'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A2E' },
  vf: { marginHorizontal: 20, height: 240, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative', overflow: 'hidden' },
  vfInner: { alignItems: 'center' },
  vfText: { color: '#1A1A2E', fontSize: 18, fontWeight: '600', marginTop: 12 },
  vfSub: { color: '#94A3B8', fontSize: 13, marginTop: 4 },
  cTL: { position: 'absolute', top: 12, left: 12, width: 24, height: 24, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#F59E0B', borderTopLeftRadius: 4 },
  cTR: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#F59E0B', borderTopRightRadius: 4 },
  cBL: { position: 'absolute', bottom: 12, left: 12, width: 24, height: 24, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#F59E0B', borderBottomLeftRadius: 4 },
  cBR: { position: 'absolute', bottom: 12, right: 12, width: 24, height: 24, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#F59E0B', borderBottomRightRadius: 4 },
  capBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginBottom: 24, paddingVertical: 15, borderRadius: 14, backgroundColor: '#F59E0B' },
  capText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  recentLabel: { fontSize: 17, fontWeight: '700', color: '#1A1A2E', paddingHorizontal: 20, marginBottom: 12 },
  recentItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, padding: 12, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  recentThumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F59E0B20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  recentTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A2E' },
  recentSub: { fontSize: 13, color: '#94A3B8' },
});
