import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { Activity, Moon, Droplets, Zap, Plus, Check } from 'lucide-react-native';
import { getHealthCorrelations, saveHealthCorrelation, generateId } from '@/lib/storage';
import type { HealthCorrelation } from '@/types/database';

export default function InsightsScreen() {
  const [correlations, setCorrelations] = useState<HealthCorrelation[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [sleep, setSleep] = useState('');
  const [stress, setStress] = useState('5');
  const [water, setWater] = useState('');
  const [exercise, setExercise] = useState('');
  const [dietNotes, setDietNotes] = useState('');
  const [skinRating, setSkinRating] = useState(5);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getHealthCorrelations().then(setCorrelations);
  }, []);

  const handleSave = async () => {
    const entry: HealthCorrelation = {
      id: generateId(),
      user_id: 'local',
      date: new Date().toISOString().split('T')[0],
      sleep_hours: sleep ? parseFloat(sleep) : undefined,
      stress_level: parseInt(stress),
      water_glasses: water ? parseInt(water) : undefined,
      exercise_minutes: exercise ? parseInt(exercise) : undefined,
      diet_notes: dietNotes || undefined,
      skin_rating: skinRating,
    };
    await saveHealthCorrelation(entry);
    const updated = await getHealthCorrelations();
    setCorrelations(updated);
    setSaved(true);
    setShowLog(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const today = correlations[0];
  const isTodayLogged = today?.date === new Date().toISOString().split('T')[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Insights</Text>
        <Text style={styles.subtitle}>Track lifestyle factors that affect your skin</Text>
      </View>

      {/* Log today button */}
      {!showLog ? (
        <TouchableOpacity
          style={[styles.logBtn, isTodayLogged && styles.logBtnLogged]}
          onPress={() => setShowLog(true)}
        >
          {isTodayLogged ? <Check size={20} color="#10b981" /> : <Plus size={20} color="#ffffff" />}
          <Text style={[styles.logBtnText, isTodayLogged && styles.logBtnTextLogged]}>
            {saved ? 'Saved!' : isTodayLogged ? "Today's log updated" : "Log Today's Wellness"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.logForm}>
          <Text style={styles.logFormTitle}>Today's Wellness Log</Text>

          <View style={styles.formRow}>
            <Moon size={16} color="#6366f1" />
            <Text style={styles.formLabel}>Sleep (hours)</Text>
            <TextInput value={sleep} onChangeText={setSleep} keyboardType="numeric" placeholder="7.5" placeholderTextColor="#94a3b8" style={styles.formInput} />
          </View>

          <View style={styles.formRow}>
            <Zap size={16} color="#f59e0b" />
            <Text style={styles.formLabel}>Stress (1-10)</Text>
            <View style={styles.ratingRow}>
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setStress(String(n))}
                  style={[styles.ratingBtn, parseInt(stress) === n && styles.ratingBtnActive]}
                >
                  <Text style={[styles.ratingBtnText, parseInt(stress) === n && styles.ratingBtnTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formRow}>
            <Droplets size={16} color="#3b82f6" />
            <Text style={styles.formLabel}>Water (glasses)</Text>
            <TextInput value={water} onChangeText={setWater} keyboardType="numeric" placeholder="8" placeholderTextColor="#94a3b8" style={styles.formInput} />
          </View>

          <View style={styles.formRow}>
            <Activity size={16} color="#10b981" />
            <Text style={styles.formLabel}>Exercise (min)</Text>
            <TextInput value={exercise} onChangeText={setExercise} keyboardType="numeric" placeholder="30" placeholderTextColor="#94a3b8" style={styles.formInput} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formGroupLabel}>Skin Rating Today (1-10)</Text>
            <View style={styles.ratingRow}>
              {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setSkinRating(n)}
                  style={[styles.ratingBtn, skinRating === n && styles.skinRatingBtnActive]}
                >
                  <Text style={[styles.ratingBtnText, skinRating === n && { color: '#e11d48' }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formGroupLabel}>Diet Notes</Text>
            <TextInput
              value={dietNotes}
              onChangeText={setDietNotes}
              placeholder="e.g., dairy, sugar, alcohol..."
              placeholderTextColor="#94a3b8"
              style={styles.textArea}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLog(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Log</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent logs */}
      {correlations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          {correlations.slice(0, 7).map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <Text style={styles.entryDate}>{new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
              <View style={styles.entryStats}>
                {entry.sleep_hours !== undefined && (
                  <View style={styles.entryStat}>
                    <Moon size={12} color="#6366f1" />
                    <Text style={styles.entryStatText}>{entry.sleep_hours}h sleep</Text>
                  </View>
                )}
                {entry.stress_level !== undefined && (
                  <View style={styles.entryStat}>
                    <Zap size={12} color="#f59e0b" />
                    <Text style={styles.entryStatText}>stress {entry.stress_level}/10</Text>
                  </View>
                )}
                {entry.water_glasses !== undefined && (
                  <View style={styles.entryStat}>
                    <Droplets size={12} color="#3b82f6" />
                    <Text style={styles.entryStatText}>{entry.water_glasses} glasses</Text>
                  </View>
                )}
                {entry.skin_rating !== undefined && (
                  <View style={[styles.entryStat, styles.skinRatingStat]}>
                    <Text style={styles.entryStatText}>skin: {entry.skin_rating}/10</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {correlations.length === 0 && !showLog && (
        <View style={styles.emptyInsights}>
          <Activity size={40} color="#e2e8f0" />
          <Text style={styles.emptyTitle}>No wellness data yet</Text>
          <Text style={styles.emptyText}>Log your daily wellness to discover correlations between lifestyle and skin health.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { paddingBottom: 40 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#e11d48', borderRadius: 14, marginHorizontal: 20, marginTop: 16, paddingVertical: 14 },
  logBtnLogged: { backgroundColor: '#d1fae5' },
  logBtnText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
  logBtnTextLogged: { color: '#10b981' },
  logForm: { backgroundColor: '#ffffff', borderRadius: 16, margin: 16, padding: 20, gap: 16 },
  logFormTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  formRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  formLabel: { flex: 1, fontSize: 13, color: '#475569' },
  formInput: { backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#0f172a', width: 80, textAlign: 'center' },
  formGroup: { gap: 8 },
  formGroupLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  ratingBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  ratingBtnActive: { backgroundColor: '#fee2e2' },
  skinRatingBtnActive: { backgroundColor: '#fee2e2' },
  ratingBtnText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  ratingBtnTextActive: { color: '#e11d48' },
  textArea: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 12, fontSize: 13, color: '#0f172a', minHeight: 70, textAlignVertical: 'top' },
  formActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingVertical: 12 },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  saveBtn: { flex: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e11d48', borderRadius: 12, paddingVertical: 12 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  entryCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 8 },
  entryDate: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  entryStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  entryStat: { flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  skinRatingStat: { backgroundColor: '#fff1f2' },
  entryStatText: { fontSize: 11, color: '#64748b' },
  emptyInsights: { alignItems: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#334155' },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 19 },
});
