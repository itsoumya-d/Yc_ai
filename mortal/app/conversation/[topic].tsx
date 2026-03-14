import { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { getAIResponse, TOPIC_LABELS, TOPIC_ICONS, type WishTopic } from '@/lib/openai';
const OPENING_MESSAGES = {
  funeral: "Hello. I'm here to help you think through your funeral and memorial preferences. There's no right or wrong answer - these are your wishes. Would you like to start with burial versus cremation, or is there something else on your mind?",
  organ_donation: "Thank you for taking time to think about organ donation. It's a deeply personal choice. Have you given any previous thought to whether you'd like to donate, or are you approaching this fresh today?",
  care_directives: "I'm glad you're thinking about your medical care wishes. These conversations can be difficult, but they're one of the greatest gifts you can give your loved ones. Let's start with something fundamental: if you were in a situation where doctors could only keep you alive through machines, what would you want?",
  personal_messages: "This is a beautiful thing you're doing - leaving words for the people you love. Who would you most like to write to first? It could be a partner, a child, a parent, a friend - whoever feels most important to start with.",
  legacy: "I'd love to help you reflect on your legacy - not in a grand sense, but in the quiet, meaningful ways you've shaped the world. What's something you've done in your life that you're genuinely proud of?",
};
export default function ConversationScreen() {
  const { topic } = useLocalSearchParams();
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const topicKey = topic;

  useEffect(() => {
    initConversation();
  }, [topic]);

  async function initConversation() {
    const { data: existing } = await supabase
      .from('wish_conversations')
      .select('id, messages')
      .eq('user_id', user?.id)
      .eq('topic', topicKey)
      .single();

    if (existing) {
      setConversationId(existing.id);
      const msgs = existing.messages ?? [];
      setMessages(msgs.length > 0 ? msgs : [createAssistantMessage(OPENING_MESSAGES[topicKey] ?? 'Hello\!')]);
    } else {
      const openingMsg = createAssistantMessage(OPENING_MESSAGES[topicKey] ?? 'Hello\!');
      const { data: newConv } = await supabase
        .from('wish_conversations')
        .insert({ user_id: user?.id, topic: topicKey, messages: [openingMsg] })
        .select('id')
        .single();
      if (newConv) setConversationId(newConv.id);
      setMessages([openingMsg]);
    }
  }
  function createAssistantMessage(text) {
    return { _id: Math.random().toString(), text, createdAt: new Date(), user: { _id: 2, name: 'Mortal AI' } };
  }

  const onSend = useCallback(async (newMessages) => {
    const userMsg = newMessages[0];
    const updatedMessages = GiftedChat.append(messages, newMessages);
    setMessages(updatedMessages);
    setLoading(true);

    const chatHistory = updatedMessages
      .slice()
      .reverse()
      .map((m) => ({ role: m.user._id === 1 ? 'user' : 'assistant', content: m.text }));

    const aiResponse = await getAIResponse(topicKey, chatHistory);
    const aiMsg = createAssistantMessage(aiResponse);
    const finalMessages = GiftedChat.append(updatedMessages, [aiMsg]);
    setMessages(finalMessages);
    setLoading(false);

    if (conversationId) {
      await supabase.from('wish_conversations').update({ messages: finalMessages, updated_at: new Date().toISOString() }).eq('id', conversationId);
    }
  }, [messages, conversationId, topicKey]);
  async function markComplete() {
    if (\!conversationId) return;
    Alert.alert('Mark as Complete', 'Mark this topic as fully documented?', [
      { text: 'Not yet', style: 'cancel' },
      { text: 'Yes, complete', onPress: async () => {
        await supabase.from('wish_conversations').update({ is_complete: true }).eq('id', conversationId);
        router.back();
      }},
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f1a' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1e1e2e', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: '#a78bfa', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20 }}>{TOPIC_ICONS[topicKey]}</Text>
        <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: '600', marginLeft: 8, flex: 1 }}>{TOPIC_LABELS[topicKey]}</Text>
        <TouchableOpacity onPress={markComplete} style={{ backgroundColor: '#4c1d95', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: '#a78bfa', fontSize: 12, fontWeight: '600' }}>Done</Text>
        </TouchableOpacity>
      </View>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        isTyping={loading}
        renderBubble={(props) => (
          <Bubble {...props}
            wrapperStyle={{ left: { backgroundColor: '#1e1e2e' }, right: { backgroundColor: '#5b21b6' } }}
            textStyle={{ left: { color: '#e2e8f0' }, right: { color: '#f5f3ff' } }}
          />
        )}
        renderSend={(props) => (
          <Send {...props} containerStyle={{ justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
            <Text style={{ color: '#a78bfa', fontSize: 24 }}>Send</Text>
          </Send>
        )}
        renderLoading={() => <ActivityIndicator size="small" color="#a78bfa" />}
        minInputToolbarHeight={60}
        textInputStyle={{ color: '#e2e8f0', backgroundColor: '#1e1e2e' }}
        textInputProps={{ placeholderTextColor: '#4a5568' }}
      />
    </View>
  );
}
