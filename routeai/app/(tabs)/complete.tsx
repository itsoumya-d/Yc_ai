import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRouteStore } from '../../store/route-store';

const ROUTE_BLUE = '#0369A1';
const GREEN = '#10B981';
const AMBER = '#F59E0B';
const BG = '#F0F7FF';
const CARD = '#FFFFFF';
const TEXT = '#0F172A';
const TEXT2 = '#64748B';

export default function CompleteScreen() {
  const { jobs, currentJobId, completeJob } = useRouteStore();
  const router = useRouter();

  const lastCompleted = jobs.filter(j => j.status === 'completed').slice(-1)[0];
  const currentJob = jobs.find(j => j.id === currentJobId || j.status === 'current');
  const focusJob = currentJob ?? lastCompleted;

  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!photoTaken) {
      Alert.alert('Photo Required', 'Please take a completion photo before submitting.');
      return;
    }
    if (!signatureDone) {
      Alert.alert('Signature Required', 'Please collect customer signature before submitting.');
      return;
    }
    if (focusJob) {
      completeJob(focusJob.id, { rating, notes, actualMinutes: focusJob.estimatedMinutes });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successScreen}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={GREEN} />
          </View>
          <Text style={s.successTitle}>Job Complete! 🎉</Text>
          <Text style={s.successSub}>{focusJob?.customer}</Text>
          <View style={s.successEarnings}>
            <Text style={s.successEarningsLabel}>Job Earnings</Text>
            <Text style={s.successEarningsNum}>${focusJob?.earnings ?? 0}</Text>
          </View>
          <View style={s.successActions}>
            <TouchableOpacity style={s.nextJobBtn} onPress={() => { setSubmitted(false); router.push('/(tabs)/index'); }}>
              <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
              <Text style={s.nextJobBtnText}>Next Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.earningsBtn} onPress={() => router.push('/(tabs)/earnings')}>
              <Text style={s.earningsBtnText}>View Earnings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!focusJob) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.empty}>
          <Ionicons name="checkmark-done-circle" size={56} color={GREEN} />
          <Text style={s.emptyTitle}>No active job</Text>
          <Text style={s.emptySub}>Start a job to complete it here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Complete Job</Text>
        <Text style={s.sub}>{focusJob.customer} · #{focusJob.stopNumber}</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Job summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryLabel}>SERVICE COMPLETED</Text>
          <Text style={s.summaryService}>{focusJob.serviceType}</Text>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryItemLabel}>Est. Time</Text>
              <Text style={s.summaryItemVal}>{focusJob.estimatedMinutes} min</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryItemLabel}>Earnings</Text>
              <Text style={[s.summaryItemVal, { color: GREEN }]}>${focusJob.earnings}</Text>
            </View>
          </View>
        </View>

        {/* Completion steps */}
        <View style={s.stepsCard}>
          <Text style={s.stepsTitle}>Completion Checklist</Text>

          {/* Photo */}
          <TouchableOpacity
            style={[s.step, photoTaken && s.stepDone]}
            onPress={() => {
              Alert.alert('Take Photo', 'Take a photo of completed work for documentation.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Simulate', onPress: () => setPhotoTaken(true) },
              ]);
            }}
          >
            <View style={[s.stepIcon, photoTaken && s.stepIconDone]}>
              {photoTaken ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Ionicons name="camera-outline" size={16} color={ROUTE_BLUE} />}
            </View>
            <View style={s.stepInfo}>
              <Text style={s.stepTitle}>Take Completion Photo *</Text>
              <Text style={s.stepSub}>{photoTaken ? '✅ Photo captured' : 'Document the completed work'}</Text>
            </View>
          </TouchableOpacity>

          {/* Signature */}
          <TouchableOpacity
            style={[s.step, signatureDone && s.stepDone]}
            onPress={() => {
              Alert.alert('Customer Signature', 'Have customer sign on your device to confirm service.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Simulate Sign', onPress: () => setSignatureDone(true) },
              ]);
            }}
          >
            <View style={[s.stepIcon, signatureDone && s.stepIconDone]}>
              {signatureDone ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Ionicons name="pencil-outline" size={16} color={ROUTE_BLUE} />}
            </View>
            <View style={s.stepInfo}>
              <Text style={s.stepTitle}>Customer Signature *</Text>
              <Text style={s.stepSub}>{signatureDone ? '✅ Signature collected' : 'Required for job completion'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Rating */}
        <View style={s.ratingCard}>
          <Text style={s.ratingTitle}>Service Quality Rating</Text>
          <Text style={s.ratingSub}>How did this job go?</Text>
          <View style={s.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? AMBER : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.ratingLabel}>{['', 'Difficult', 'Below avg', 'Average', 'Good', 'Excellent'][rating]}</Text>
        </View>

        {/* Notes */}
        <View style={s.notesCard}>
          <Text style={s.notesTitle}>Job Notes (optional)</Text>
          <TextInput
            style={s.notesInput}
            placeholder="Any notes about this job for the office..."
            placeholderTextColor={TEXT2}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Parts summary */}
        {(focusJob.parts ?? []).length > 0 && (
          <View style={s.partsCard}>
            <Text style={s.partsTitle}>Parts Used</Text>
            {(focusJob.parts ?? []).map(p => (
              <View key={p.id} style={s.partRow}>
                <Text style={s.partName}>{p.name} ×{p.quantity}</Text>
                <Text style={s.partCost}>${(p.quantity * p.unitCost).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, (!photoTaken || !signatureDone) && s.submitBtnDisabled]}
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={s.submitBtnText}>Submit & Complete Job</Text>
        </TouchableOpacity>

        {(!photoTaken || !signatureDone) && (
          <Text style={s.submitHint}>Complete required steps above to submit</Text>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 22, fontWeight: '800', color: TEXT },
  sub: { fontSize: 13, color: TEXT2, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 14 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: TEXT },
  emptySub: { fontSize: 14, color: TEXT2 },

  successScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 28, fontWeight: '800', color: TEXT },
  successSub: { fontSize: 16, color: TEXT2 },
  successEarnings: { backgroundColor: '#ECFDF5', borderRadius: 16, padding: 20, alignItems: 'center', width: '100%' },
  successEarningsLabel: { fontSize: 13, color: TEXT2, marginBottom: 4 },
  successEarningsNum: { fontSize: 40, fontWeight: '800', color: GREEN },
  successActions: { width: '100%', gap: 10 },
  nextJobBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ROUTE_BLUE, borderRadius: 14, padding: 16, justifyContent: 'center' },
  nextJobBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  earningsBtn: { padding: 14, alignItems: 'center' },
  earningsBtnText: { color: TEXT2, fontSize: 14, fontWeight: '600' },

  summaryCard: { backgroundColor: ROUTE_BLUE, borderRadius: 16, padding: 16, marginBottom: 14 },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  summaryService: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 16 },
  summaryItem: {},
  summaryItemLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  summaryItemVal: { fontSize: 18, fontWeight: '800', color: '#fff' },

  stepsCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  stepsTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  stepDone: { opacity: 0.7 },
  stepIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  stepIconDone: { backgroundColor: GREEN },
  stepInfo: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '600', color: TEXT },
  stepSub: { fontSize: 12, color: TEXT2, marginTop: 2 },

  ratingCard: { backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  ratingTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 4 },
  ratingSub: { fontSize: 12, color: TEXT2, marginBottom: 14 },
  stars: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  ratingLabel: { fontSize: 14, fontWeight: '700', color: AMBER },

  notesCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  notesTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 8 },
  notesInput: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 12, color: TEXT, fontSize: 13, minHeight: 72, textAlignVertical: 'top', borderWidth: 1, borderColor: '#E2E8F0' },

  partsCard: { backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  partsTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 8 },
  partRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  partName: { fontSize: 13, color: TEXT },
  partCost: { fontSize: 13, fontWeight: '600', color: GREEN },

  submitBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: GREEN, borderRadius: 14, padding: 16, justifyContent: 'center', marginBottom: 6 },
  submitBtnDisabled: { backgroundColor: '#94A3B8' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  submitHint: { textAlign: 'center', fontSize: 12, color: TEXT2 },
});
