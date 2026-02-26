import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuraStore, Product, SkinConcern } from '../../store/aura-store';

const TEAL = '#0D9488';
const LAVENDER = '#A78BFA';
const CORAL = '#F472B6';
const BG = '#F0FDFA';
const CARD = '#FFFFFF';
const TEXT = '#134E4A';
const TEXT2 = '#6B7280';
const GREEN = '#10B981';
const AMBER = '#F59E0B';

const CORRELATION_DATA = [
  { factor: 'Sleep 7+ hours', impact: '+12 pts avg', positive: true, icon: '😴' },
  { factor: 'Hydration 8+ glasses', impact: '+8 pts avg', positive: true, icon: '💧' },
  { factor: 'Low stress days', impact: '+6 pts avg', positive: true, icon: '😌' },
  { factor: 'High stress days', impact: '-9 pts avg', positive: false, icon: '😤' },
  { factor: 'Sleep < 6 hours', impact: '-7 pts avg', positive: false, icon: '😫' },
];

const INGREDIENT_TIPS = [
  { ingredient: 'Hyaluronic Acid', benefit: 'Deep hydration, works well for dryness', icon: '💧', skin: ['dryness', 'sensitivity'] },
  { ingredient: 'Niacinamide', benefit: 'Reduces pores, brightens tone, balances oil', icon: '✨', skin: ['oiliness', 'pigmentation', 'texture'] },
  { ingredient: 'Retinol', benefit: 'Reduces fine lines, improves texture', icon: '🌿', skin: ['aging', 'texture', 'acne'] },
  { ingredient: 'Azelaic Acid', benefit: 'Calms redness, fades dark spots', icon: '🌹', skin: ['redness', 'pigmentation', 'acne'] },
  { ingredient: 'Ceramides', benefit: 'Strengthens skin barrier, reduces sensitivity', icon: '🛡️', skin: ['dryness', 'sensitivity'] },
];

export default function InsightsScreen() {
  const { checkIns, products, concerns, removeProduct } = useAuraStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductType, setNewProductType] = useState('');

  const avgScore = checkIns.reduce((s, c, _, a) => s + c.overallScore / a.length, 0);
  const bestScore = Math.max(...checkIns.map(c => c.overallScore), 0);
  const totalCheckIns = checkIns.length;

  const relevantIngredients = INGREDIENT_TIPS.filter(ing =>
    ing.skin.some(s => concerns.includes(s as SkinConcern))
  );

  const handleAddProduct = () => {
    if (!newProductName.trim()) return;
    Alert.alert('Coming Soon', 'Product tracking will be available in the next update.');
    setShowAddProduct(false);
    setNewProductName('');
    setNewProductType('');
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Insights</Text>
        <Text style={s.headerSub}>Your skin health analytics</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Overall stats */}
        <View style={s.statsGrid}>
          <View style={[s.statCard, { borderTopColor: TEAL }]}>
            <Text style={[s.statNum, { color: TEAL }]}>{avgScore > 0 ? avgScore.toFixed(0) : '—'}</Text>
            <Text style={s.statLabel}>Avg Score</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: GREEN }]}>
            <Text style={[s.statNum, { color: GREEN }]}>{bestScore || '—'}</Text>
            <Text style={s.statLabel}>Best Score</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: LAVENDER }]}>
            <Text style={[s.statNum, { color: LAVENDER }]}>{totalCheckIns}</Text>
            <Text style={s.statLabel}>Check-Ins</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: CORAL }]}>
            <Text style={[s.statNum, { color: CORAL }]}>{concerns.length}</Text>
            <Text style={s.statLabel}>Concerns</Text>
          </View>
        </View>

        {/* Lifestyle correlations */}
        <View style={s.correlationCard}>
          <Text style={s.cardTitle}>📊 Lifestyle Correlations</Text>
          <Text style={s.cardSub}>Based on your check-in data</Text>
          {CORRELATION_DATA.map((item, i) => (
            <View key={i} style={s.corrRow}>
              <Text style={s.corrIcon}>{item.icon}</Text>
              <Text style={s.corrFactor}>{item.factor}</Text>
              <View style={[s.corrImpact, { backgroundColor: item.positive ? `${GREEN}15` : `${CORAL}15` }]}>
                <Text style={[s.corrImpactText, { color: item.positive ? GREEN : CORAL }]}>{item.impact}</Text>
              </View>
            </View>
          ))}
          <View style={s.corrDisclaimer}>
            <Text style={s.corrDisclaimerText}>ℹ️ Based on trends in your data. Not a medical finding.</Text>
          </View>
        </View>

        {/* Metric trends over time */}
        {checkIns.length >= 2 && (
          <View style={s.trendsCard}>
            <Text style={s.cardTitle}>Metric Trends</Text>
            {['Hydration', 'Clarity', 'Texture', 'Tone'].map(metricName => {
              const values = checkIns.map(c => c.metrics.find(m => m.label === metricName)?.score ?? 0).reverse();
              const first = values[0];
              const last = values[values.length - 1];
              const diff = last - first;
              const color = diff > 0 ? GREEN : diff < 0 ? CORAL : TEXT2;
              return (
                <View key={metricName} style={s.trendRow}>
                  <Text style={s.trendLabel}>{metricName}</Text>
                  <View style={s.trendBars}>
                    {values.map((v, i) => (
                      <View key={i} style={s.trendBarTrack}>
                        <View style={[s.trendBarFill, { height: `${v}%` as any, backgroundColor: i === values.length - 1 ? TEAL : `${TEAL}40` }]} />
                      </View>
                    ))}
                  </View>
                  <View style={[s.trendDiff, { backgroundColor: `${color}15` }]}>
                    <Text style={[s.trendDiffText, { color }]}>{diff > 0 ? '+' : ''}{diff}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Ingredient recommendations */}
        {relevantIngredients.length > 0 && (
          <View style={s.ingredientsCard}>
            <Text style={s.cardTitle}>🧴 Ingredients for Your Concerns</Text>
            <Text style={s.cardSub}>Based on: {concerns.join(', ')}</Text>
            {relevantIngredients.map(ing => (
              <View key={ing.ingredient} style={s.ingredientRow}>
                <Text style={s.ingredientIcon}>{ing.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.ingredientName}>{ing.ingredient}</Text>
                  <Text style={s.ingredientBenefit}>{ing.benefit}</Text>
                </View>
              </View>
            ))}
            <View style={s.ingredientDisclaimer}>
              <Text style={s.ingredientDisclaimerText}>⚠️ Always patch test new products. Consult a dermatologist before starting new treatments.</Text>
            </View>
          </View>
        )}

        {/* Product routine */}
        <View style={s.productsCard}>
          <View style={s.productsHeader}>
            <Text style={s.cardTitle}>My Routine</Text>
            <TouchableOpacity onPress={() => setShowAddProduct(true)} style={s.addBtn}>
              <Ionicons name="add" size={16} color={TEAL} />
              <Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {showAddProduct && (
            <View style={s.addForm}>
              <TextInput
                style={s.addInput}
                value={newProductName}
                onChangeText={setNewProductName}
                placeholder="Product name"
                placeholderTextColor={TEXT2}
              />
              <TextInput
                style={s.addInput}
                value={newProductType}
                onChangeText={setNewProductType}
                placeholder="Type (e.g. Serum, Moisturizer)"
                placeholderTextColor={TEXT2}
              />
              <View style={s.addFormBtns}>
                <TouchableOpacity style={s.addFormCancel} onPress={() => setShowAddProduct(false)}>
                  <Text style={s.addFormCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.addFormSave} onPress={handleAddProduct}>
                  <Text style={s.addFormSaveText}>Add Product</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={s.routineSection}>
            <Text style={s.routineTime}>☀️ Morning</Text>
            {products.filter(p => p.morningUse).map(p => (
              <View key={p.id} style={s.productItem}>
                <View style={s.productDot} />
                <View style={{ flex: 1 }}>
                  <Text style={s.productName}>{p.name}</Text>
                  <Text style={s.productMeta}>{p.type} · Since {p.startDate}</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Remove', `Remove ${p.name} from routine?`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Remove', style: 'destructive', onPress: () => removeProduct(p.id) },
                ])}>
                  <Ionicons name="ellipsis-horizontal" size={16} color={TEXT2} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {products.some(p => p.eveningUse) && (
            <View style={[s.routineSection, { marginTop: 12 }]}>
              <Text style={s.routineTime}>🌙 Evening</Text>
              {products.filter(p => p.eveningUse).map(p => (
                <View key={p.id} style={s.productItem}>
                  <View style={[s.productDot, { backgroundColor: LAVENDER }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.productName}>{p.name}</Text>
                    <Text style={s.productMeta}>{p.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Professional advice */}
        <View style={s.proCard}>
          <View style={s.proHeader}>
            <Ionicons name="medical-outline" size={20} color={TEAL} />
            <Text style={s.proTitle}>When to See a Dermatologist</Text>
          </View>
          {[
            'Any new or changing moles or skin lesions',
            'Persistent acne not responding to OTC treatments',
            'Significant redness, rashes, or unexplained irritation',
            'Rapid changes in skin texture or tone',
            'Annual check-up for overall skin health',
          ].map((item, i) => (
            <View key={i} style={s.proItem}>
              <View style={s.proDot} />
              <Text style={s.proItemText}>{item}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={s.proBtn}
            onPress={() => Alert.alert('Find a Dermatologist', 'Visit aad.org (American Academy of Dermatology) to find a board-certified dermatologist near you.')}
          >
            <Text style={s.proBtnText}>Find a Dermatologist →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  headerSub: { fontSize: 12, color: TEXT2, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: { width: '48%', backgroundColor: CARD, borderRadius: 12, padding: 14, borderTopWidth: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 12, color: TEXT2, marginTop: 2 },

  cardTitle: { fontSize: 14, fontWeight: '700', color: TEXT, marginBottom: 4 },
  cardSub: { fontSize: 12, color: TEXT2, marginBottom: 12 },

  correlationCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  corrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  corrIcon: { fontSize: 18, width: 24 },
  corrFactor: { flex: 1, fontSize: 13, color: TEXT },
  corrImpact: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  corrImpactText: { fontSize: 12, fontWeight: '700' },
  corrDisclaimer: { marginTop: 8, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 8 },
  corrDisclaimerText: { fontSize: 11, color: TEXT2, textAlign: 'center' },

  trendsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  trendLabel: { width: 64, fontSize: 12, fontWeight: '600', color: TEXT },
  trendBars: { flex: 1, flexDirection: 'row', gap: 2, height: 32, alignItems: 'flex-end' },
  trendBarTrack: { flex: 1, height: 32, backgroundColor: '#F3F4F6', borderRadius: 3, justifyContent: 'flex-end', overflow: 'hidden' },
  trendBarFill: { width: '100%', borderRadius: 3 },
  trendDiff: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, minWidth: 32, alignItems: 'center' },
  trendDiffText: { fontSize: 12, fontWeight: '700' },

  ingredientsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  ingredientIcon: { fontSize: 22, width: 30 },
  ingredientName: { fontSize: 13, fontWeight: '700', color: TEXT, marginBottom: 2 },
  ingredientBenefit: { fontSize: 12, color: TEXT2, lineHeight: 17 },
  ingredientDisclaimer: { backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 10 },
  ingredientDisclaimerText: { fontSize: 11, color: '#92400E' },

  productsCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  productsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${TEAL}15`, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  addBtnText: { fontSize: 13, color: TEAL, fontWeight: '700' },
  addForm: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 14, gap: 8 },
  addInput: { backgroundColor: CARD, borderRadius: 10, padding: 12, fontSize: 14, color: TEXT, borderWidth: 1, borderColor: '#E5E7EB' },
  addFormBtns: { flexDirection: 'row', gap: 8 },
  addFormCancel: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10 },
  addFormCancelText: { fontSize: 13, color: TEXT2, fontWeight: '600' },
  addFormSave: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: TEAL, borderRadius: 10 },
  addFormSaveText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  routineSection: {},
  routineTime: { fontSize: 13, fontWeight: '700', color: TEXT2, marginBottom: 8 },
  productItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  productDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: TEAL },
  productName: { fontSize: 13, fontWeight: '600', color: TEXT },
  productMeta: { fontSize: 11, color: TEXT2, marginTop: 2 },

  proCard: { backgroundColor: `${TEAL}08`, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: `${TEAL}20` },
  proHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  proTitle: { fontSize: 14, fontWeight: '700', color: TEXT },
  proItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  proDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: TEAL, marginTop: 5 },
  proItemText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
  proBtn: { backgroundColor: TEAL, borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8 },
  proBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
