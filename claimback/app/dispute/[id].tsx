import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface DisputeLetter {
  id: string;
  bill_id: string;
  letter_content: string;
  status: 'draft' | 'sent' | 'responded';
  created_at: string;
}

export default function DisputeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [letter, setLetter] = useState<DisputeLetter | null>(null);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadLetter = useCallback(async () => {
    const { data } = await supabase
      .from('dispute_letters')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setLetter(data);
      setContent(data.letter_content);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { loadLetter(); }, [loadLetter]);

  async function saveLetter() {
    if (!letter) return;
    setSaving(true);
    await supabase.from('dispute_letters').update({ letter_content: content }).eq('id', letter.id);
    setLetter((prev) => prev ? { ...prev, letter_content: content } : prev);
    setEditing(false);
    setSaving(false);
  }

  async function markSent() {
    if (!letter) return;
    Alert.alert('Mark as Sent', 'Have you sent this dispute letter?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Sent',
        onPress: async () => {
          await supabase.from('dispute_letters').update({ status: 'sent' }).eq('id', letter.id);
          setLetter((prev) => prev ? { ...prev, status: 'sent' } : prev);
        },
      },
    ]);
  }

  async function shareContent() {
    if (!letter) return;
    await Share.share({
      message: letter.letter_content,
      title: 'Dispute Letter',
    });
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (!letter) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Letter not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pb-4 pt-14">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Dispute Letter</Text>
            <Text className="text-sm text-gray-500 capitalize">{letter.status}</Text>
          </View>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'checkmark-circle' : 'pencil-outline'} size={22} color="#059669" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        {editing ? (
          <TextInput
            className="min-h-64 rounded-2xl bg-white p-4 text-sm leading-relaxed text-gray-800 shadow-sm"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        ) : (
          <View className="rounded-2xl bg-white p-5 shadow-sm">
            <Text className="text-sm leading-relaxed text-gray-800">{letter.letter_content}</Text>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View className="border-t border-gray-100 bg-white p-5 gap-3">
        {editing ? (
          <TouchableOpacity
            className={`items-center rounded-xl py-4 ${saving ? 'bg-brand-500 opacity-70' : 'bg-brand-600'}`}
            onPress={saveLetter}
            disabled={saving}
          >
            <Text className="text-base font-semibold text-white">
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="gap-3">
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-xl bg-brand-600 py-4"
              onPress={shareContent}
            >
              <Ionicons name="share-outline" size={18} color="white" />
              <Text className="text-base font-semibold text-white">Share / Export Letter</Text>
            </TouchableOpacity>
            {letter.status === 'draft' && (
              <TouchableOpacity
                className="items-center rounded-xl border border-gray-200 py-3.5"
                onPress={markSent}
              >
                <Text className="font-medium text-gray-700">Mark as Sent</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
