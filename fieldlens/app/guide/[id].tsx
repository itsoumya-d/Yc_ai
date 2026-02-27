import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Play, ChevronRight, BookOpen } from 'lucide-react-native';
import { getGuideById } from '@/lib/guides';

export default function GuideScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const guide = getGuideById(id ?? '');

  if (!guide) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <BookOpen size={40} color="#374151" />
          <Text style={styles.notFoundText}>Guide not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.tradeTag}>
          <Text style={styles.tradeTagText}>{guide.trade.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{guide.title}</Text>
        <Text style={styles.desc}>{guide.description}</Text>

        <View style={styles.metaRow}>
          <Clock size={14} color="#9ca3af" />
          <Text style={styles.metaText}>{guide.estimated_minutes} min</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{guide.steps.length} steps</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={[styles.metaText, guide.difficulty === 'intermediate' && { color: '#f59e0b' }]}>
            {guide.difficulty}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => router.push(`/session/${guide.id}`)}
        >
          <Play size={20} color="#111827" />
          <Text style={styles.startBtnText}>Start Task</Text>
        </TouchableOpacity>

        <Text style={styles.stepsTitle}>Steps Overview</Text>
        {guide.steps.map((step, i) => (
          <View key={i} style={styles.stepCard}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <View style={styles.stepMeta}>
                <Clock size={11} color="#6b7280" />
                <Text style={styles.stepMetaText}>{step.estimated_minutes} min</Text>
                {step.code_reference && (
                  <>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.codeRef}>{step.code_reference}</Text>
                  </>
                )}
              </View>
              {step.tools.length > 0 && (
                <Text style={styles.tools}>Tools: {step.tools.join(', ')}</Text>
              )}
            </View>
            <ChevronRight size={16} color="#374151" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#111827' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  tradeTag: { backgroundColor: '#d97706', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  tradeTagText: { fontSize: 11, fontWeight: '800', color: '#111827' },
  content: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  desc: { fontSize: 14, color: '#9ca3af', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#9ca3af' },
  dot: { fontSize: 13, color: '#374151' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#d97706', borderRadius: 16, paddingVertical: 16 },
  startBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  stepsTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginTop: 8 },
  stepCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#1e293b', borderRadius: 14, padding: 14 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#d97706', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#111827' },
  stepContent: { flex: 1, gap: 4 },
  stepTitle: { fontSize: 14, fontWeight: '600', color: '#ffffff' },
  stepMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepMetaText: { fontSize: 11, color: '#6b7280' },
  codeRef: { fontSize: 11, color: '#60a5fa', fontFamily: 'monospace' },
  tools: { fontSize: 11, color: '#6b7280' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: '#6b7280' },
});
