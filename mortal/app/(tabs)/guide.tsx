import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVaultStore } from '../../store/vault-store';

const SAGE = '#5B8C5A';
const GOLD = '#C4A35A';
const CREAM = '#FDFBF7';
const IVORY = '#E8DFD0';
const TEXT = '#2D3B2C';
const TEXT2 = '#6B7B6A';

const SUGGESTED = [
  'How do I write a letter to my family?',
  'What documents do I need for a complete plan?',
  'How should I think about digital assets?',
  'What is a healthcare directive?',
];

export default function GuideScreen() {
  const { aiConversation, sendAiMessage } = useVaultStore();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async (text?: string) => {
    const message = text ?? input.trim();
    if (!message) return;
    setInput('');
    setIsSending(true);
    setTimeout(() => {
      sendAiMessage(message);
      setIsSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }, 800);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={s.avatar}>
              <Text style={s.avatarIcon}>🌿</Text>
            </View>
            <View>
              <Text style={s.title}>Your Legacy Guide</Text>
              <Text style={s.sub}>Thoughtful · Private · Always here</Text>
            </View>
          </View>
          <View style={s.onlineDot} />
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Ionicons name="shield-checkmark-outline" size={14} color={SAGE} />
          <Text style={s.disclaimerText}>Conversations are private and never shared. This is not legal or financial advice.</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={s.messages}
          contentContainerStyle={s.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {aiConversation.map((msg) => (
            <View key={msg.id} style={[s.msgRow, msg.role === 'user' && s.msgRowUser]}>
              {msg.role === 'assistant' && (
                <View style={s.msgAvatar}><Text style={s.msgAvatarIcon}>🌿</Text></View>
              )}
              <View style={[s.bubble, msg.role === 'user' ? s.bubbleUser : s.bubbleAssistant]}>
                <Text style={[s.bubbleText, msg.role === 'user' && s.bubbleTextUser]}>{msg.content}</Text>
                <Text style={[s.timestamp, msg.role === 'user' && s.timestampUser]}>{msg.timestamp}</Text>
              </View>
            </View>
          ))}

          {isSending && (
            <View style={s.msgRow}>
              <View style={s.msgAvatar}><Text style={s.msgAvatarIcon}>🌿</Text></View>
              <View style={s.bubbleAssistant}>
                <View style={s.typingDots}>
                  {[0, 1, 2].map(i => <View key={i} style={[s.dot, { opacity: 0.4 + i * 0.2 }]} />)}
                </View>
              </View>
            </View>
          )}

          {/* Suggested questions (only if few messages) */}
          {aiConversation.length <= 1 && !isSending && (
            <View style={s.suggested}>
              <Text style={s.suggestedTitle}>Explore these topics</Text>
              {SUGGESTED.map((q) => (
                <TouchableOpacity key={q} style={s.suggestedBtn} onPress={() => handleSend(q)}>
                  <Text style={s.suggestedText}>{q}</Text>
                  <Ionicons name="arrow-forward" size={14} color={SAGE} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor={TEXT2}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || isSending) && s.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isSending}
          >
            <Ionicons name="send" size={18} color={(!input.trim() || isSending) ? TEXT2 : '#fff'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: IVORY },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E8F0E8', alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 22 },
  title: { fontSize: 16, fontWeight: '700', color: TEXT },
  sub: { fontSize: 12, color: TEXT2, marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: SAGE },
  disclaimer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#F0F5F0', borderBottomWidth: 1, borderBottomColor: '#D4E4D3' },
  disclaimerText: { flex: 1, fontSize: 12, color: SAGE, lineHeight: 16 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F0E8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  msgAvatarIcon: { fontSize: 16 },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 14 },
  bubbleAssistant: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: IVORY, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: SAGE, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, color: TEXT, lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },
  timestamp: { fontSize: 11, color: TEXT2, marginTop: 6, textAlign: 'right' },
  timestampUser: { color: 'rgba(255,255,255,0.6)' },
  typingDots: { flexDirection: 'row', gap: 6, padding: 4, alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: SAGE },
  suggested: { marginTop: 8, gap: 8 },
  suggestedTitle: { fontSize: 13, fontWeight: '600', color: TEXT2, marginBottom: 4 },
  suggestedBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: IVORY },
  suggestedText: { flex: 1, fontSize: 14, color: TEXT, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: IVORY },
  input: { flex: 1, backgroundColor: '#F8F5F0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: TEXT, maxHeight: 100, borderWidth: 1, borderColor: IVORY },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: SAGE, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: IVORY },
});
