import { View, Text, StyleSheet } from 'react-native';
import type { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarText}>🕊️</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.aiText]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isUser ? styles.userTime : styles.aiTime]}>
          {new Date(message.created_at || message.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  aiContainer: { justifyContent: 'flex-start' },
  userContainer: { justifyContent: 'flex-end' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2d1b4e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  aiAvatarText: { fontSize: 16 },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiBubble: {
    backgroundColor: '#1e1030',
    borderWidth: 1,
    borderColor: '#2d1b4e',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#7c3aed',
    borderBottomRightRadius: 4,
  },
  text: { fontSize: 15, lineHeight: 22 },
  aiText: { color: '#e2e8f0' },
  userText: { color: '#ffffff' },
  time: { fontSize: 10, marginTop: 4 },
  aiTime: { color: '#6b7280' },
  userTime: { color: '#ddd6fe' },
});
