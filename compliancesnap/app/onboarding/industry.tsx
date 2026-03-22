import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const OPTIONS = [
  { id: 'food', label: 'Food and Beverage', icon: 'restaurant' },
  { id: 'health', label: 'Healthcare', icon: 'medkit' },
  { id: 'construction', label: 'Construction', icon: 'hammer' },
  { id: 'retail', label: 'Retail', icon: 'storefront' },
];

export default function IndustryScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <View style={s.container}>
      <Text style={s.title}>Your Industry</Text>
      <Text style={s.sub}>Select the option that best describes you.</Text>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.id} style={[s.option, selected === opt.id && s.optSel]} onPress={() => setSelected(opt.id)}>
            <Ionicons name={opt.icon as any} size={24} color={selected === opt.id ? '#F59E0B' : '#64748B'} />
            <Text style={[s.optText, selected === opt.id && s.optTextSel]}>{opt.label}</Text>
            {selected === opt.id && <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={[s.btn, !selected && s.btnDis]} onPress={() => selected && router.push('/onboarding/requirements')} disabled={!selected}>
        <Text style={s.btnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  sub: { fontSize: 15, color: '#64748B', marginBottom: 24 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', marginBottom: 10 },
  optSel: { borderColor: '#F59E0B', backgroundColor: '#F59E0B18' },
  optText: { flex: 1, fontSize: 16, color: '#64748B' },
  optTextSel: { color: '#1A1A2E', fontWeight: '600' },
  btn: { backgroundColor: '#F59E0B', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  btnDis: { backgroundColor: '#E2E8F0' },
  btnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
