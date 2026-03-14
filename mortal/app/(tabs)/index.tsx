import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { TOPIC_LABELS, TOPIC_DESCRIPTIONS, TOPIC_ICONS, type WishTopic } from '@/lib/openai';

const TOPICS: WishTopic[] = ['funeral', 'organ_donation', 'care_directives', 'personal_messages', 'legacy'];

export default function WishesScreen() {
  const user = useAuthStore((s) => s.user);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => { authenticateUser(); }, []);

  async function authenticateUser() {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (\!hasHardware || \!isEnrolled) { setAuthenticated(true); loadProgress(); return; }
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Authenticate to access Mortal', cancelLabel: 'Cancel' });
    if (result.success) { setAuthenticated(true); loadProgress(); }
  }

  async function loadProgress() {
    const { data } = await supabase.from('wish_conversations').select('topic').eq('user_id', user?.id).eq('is_complete', true);
    setCompletedTopics(new Set(data?.map((d) => d.topic) ?? []));
  }

  if (\!authenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#f1f5f9', marginBottom: 8, textAlign: 'center' }}>Mortal requires authentication</Text>
        <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 32 }}>Your wishes are protected. Please authenticate to continue.</Text>
        <TouchableOpacity style={{ backgroundColor: '#7c3aed', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }} onPress={authenticateUser}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Authenticate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completedCount = TOPICS.filter((t) => completedTopics.has(t)).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 }}>My Wishes</Text>
        <Text style={{ color: '#64748b', fontSize: 14 }}>{completedCount} of {TOPICS.length} topics documented</Text>
        
        <View style={{ backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Overall progress</Text>
            <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600' }}>{Math.round((completedCount / TOPICS.length) * 100)}
  const completedCount = TOPICS.filter((t) => completedTopics.has(t)).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16 }}>
        <Text style={{ fontSize: 26, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 }}>My Wishes</Text>
        <Text style={{ color: '#64748b', fontSize: 14 }}>{completedCount} of {TOPICS.length} topics documented</Text>
        <View style={{ backgroundColor: '#1e1e2e', borderRadius: 12, padding: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#94a3b8', fontSize: 13 }}>Overall progress</Text>
            <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600' }}>{Math.round((completedCount / TOPICS.length) * 100)}%</Text>
          </View>
          <View style={{ backgroundColor: '#2d2d3f', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <View style={{ backgroundColor: '#7c3aed', height: 8, borderRadius: 4, width: (completedCount / TOPICS.length * 100).toString() + '%' }} />
          </View>
        </View>
      </View>
      <View style={{ padding: 24, gap: 12 }}>
        {TOPICS.map((topic) => {
          const done = completedTopics.has(topic);
          return (
            <TouchableOpacity
              key={topic}
              style={{ backgroundColor: '#1e1e2e', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: done ? '#4c1d95' : '#2d2d3f' }}
              onPress={() => router.push('/conversation/' + topic)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 28, marginRight: 16 }}>{TOPIC_ICONS[topic]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#e2e8f0', marginBottom: 4 }}>{TOPIC_LABELS[topic]}</Text>
                  <Text style={{ color: '#64748b', fontSize: 13 }}>{TOPIC_DESCRIPTIONS[topic]}</Text>
                </View>
                {done && <Text style={{ color: '#a78bfa', fontSize: 20, marginLeft: 8 }}>checkmark</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
