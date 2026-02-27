import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState } from 'react';
import { useSkinStore } from '@/stores/skin';
import { COLORS, BODY_LOCATIONS, RISK_COLORS } from '@/constants/theme';

export default function SpotsScreen() {
  const { spots, addSpot, removeSpot } = useSkinStore();
  const [adding, setAdding] = useState(false);
  const [nickname, setNickname] = useState('');
  const [location, setLocation] = useState(BODY_LOCATIONS[0]);

  const handleAdd = () => {
    if (!nickname) { Alert.alert('Required', 'Please give this spot a nickname.'); return; }
    addSpot({ id: Date.now().toString(), nickname, bodyLocation: location, photos: [], createdAt: new Date().toISOString(), lastChecked: new Date().toISOString(), isWatched: false });
    setNickname(''); setLocation(BODY_LOCATIONS[0]); setAdding(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ padding: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>My Spots ({spots.length})</Text>
          <TouchableOpacity onPress={() => setAdding(!adding)} style={{ backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ color: 'white', fontWeight: '600' }}>{adding ? 'Cancel' : '+ Add Spot'}</Text>
          </TouchableOpacity>
        </View>

        {adding && (
          <View style={{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border, gap: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}>Add New Spot</Text>
            <TextInput value={nickname} onChangeText={setNickname}
              placeholder="Nickname (e.g. 'left arm mole')"
              placeholderTextColor={COLORS.textMuted}
              style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, fontSize: 15, color: COLORS.text }}
            />
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.text }}>Body Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {BODY_LOCATIONS.map((loc) => (
                  <TouchableOpacity key={loc} onPress={() => setLocation(loc)} style={{
                    backgroundColor: location === loc ? COLORS.primary : COLORS.card,
                    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
                    borderWidth: 1, borderColor: location === loc ? COLORS.primary : COLORS.border,
                  }}>
                    <Text style={{ color: location === loc ? 'white' : COLORS.text, fontSize: 13 }}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700' }}>Add Spot</Text>
            </TouchableOpacity>
          </View>
        )}

        {spots.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text style={{ fontSize: 40 }}>🔬</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 12 }}>No Spots Tracked</Text>
            <Text style={{ color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 }}>Add skin spots to start monitoring changes over time.</Text>
          </View>
        ) : (
          spots.map((spot) => {
            const latest = spot.photos[spot.photos.length - 1];
            const riskColor = latest ? RISK_COLORS[latest.analysis.riskLevel] : COLORS.textMuted;
            return (
              <View key={spot.id} style={{ backgroundColor: COLORS.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>{spot.nickname}</Text>
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>{spot.bodyLocation}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{spot.photos.length} scan(s)</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    {latest && (
                      <View style={{ backgroundColor: riskColor + '20', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ color: riskColor, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
                          {latest.analysis.riskLevel}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity onPress={() => Alert.alert('Remove', 'Remove this spot?', [{ text: 'Cancel' }, { text: 'Remove', onPress: () => removeSpot(spot.id), style: 'destructive' }])}>
                      <Text style={{ color: COLORS.error, fontSize: 12 }}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
