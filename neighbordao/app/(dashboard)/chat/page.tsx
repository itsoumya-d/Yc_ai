'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Hash, MessageCircle } from 'lucide-react';
import { cn, initials } from '@/lib/utils';

interface Message {
  id: string; sender: string; initials: string; content: string;
  time: string; isMine?: boolean;
}

interface Channel {
  id: string; type: 'group' | 'dm'; name: string; lastMessage: string; unread: number;
}

const CHANNELS: Channel[] = [
  { id: 'c1', type: 'group', name: 'general', lastMessage: 'Thanks for organizing!', unread: 0 },
  { id: 'c2', type: 'group', name: 'safety', lastMessage: 'Water main update', unread: 2 },
  { id: 'c3', type: 'group', name: 'events', lastMessage: 'Block party this Sat!', unread: 0 },
  { id: 'c4', type: 'group', name: 'speed-bumps', lastMessage: 'City got back to us', unread: 5 },
];

const DMS: Channel[] = [
  { id: 'd1', type: 'dm', name: 'Sarah M.', lastMessage: 'Can I borrow the ladder?', unread: 1 },
  { id: 'd2', type: 'dm', name: 'Mike T.', lastMessage: 'Sure, it\'s available Saturday', unread: 0 },
  { id: 'd3', type: 'dm', name: 'Lisa R.', lastMessage: 'See you at the meeting!', unread: 0 },
];

const THREAD_MESSAGES: Record<string, Message[]> = {
  c4: [
    { id: 'm1', sender: 'Mike T.', initials: 'MT', content: 'Has anyone contacted the city about the cost estimate? I called last week and they said $800 per bump.', time: '2:15 PM' },
    { id: 'm2', sender: 'Sarah M.', initials: 'SM', content: 'That\'s less than I expected. With 3 bumps at $2,400 total split across 40 households, that\'s only $60 each.', time: '2:22 PM' },
    { id: 'm3', sender: 'Lisa R.', initials: 'LR', content: 'I think we should also look at those speed radar signs as an alternative. Less permanent and cheaper.', time: '2:30 PM' },
    { id: 'm4', sender: 'David K.', initials: 'DK', content: 'The radar signs are around $600-800 each. They don\'t slow traffic the same way though.', time: '2:45 PM' },
    { id: 'm5', sender: 'You', initials: 'YO', content: 'I voted for speed bumps in the proposal. The radar signs haven\'t worked on Elm St at all.', time: '3:01 PM', isMine: true },
  ],
  c2: [
    { id: 'm1', sender: 'Mike T.', initials: 'MT', content: 'Reminder: water main repair on Elm St tomorrow 8am–2pm. Expect low pressure.', time: '11:30 AM' },
    { id: 'm2', sender: 'Sarah M.', initials: 'SM', content: 'Thanks for the heads up! Any idea how long it\'ll be?', time: '11:45 AM' },
    { id: 'm3', sender: 'Mike T.', initials: 'MT', content: 'Contractor said 6 hours max. Should be done by 2pm.', time: '12:02 PM' },
  ],
};

const AVATAR_COLORS: Record<string, string> = {
  MT: '#2563EB', SM: '#16A34A', LR: '#7C3AED', DK: '#A16207', YO: '#DC2626',
};

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[3]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(THREAD_MESSAGES[activeChannel.id] ?? []);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(THREAD_MESSAGES[activeChannel.id] ?? []);
  }, [activeChannel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!message.trim()) return;
    setMessages(prev => [...prev, {
      id: `new-${Date.now()}`, sender: 'You', initials: 'YO',
      content: message, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      isMine: true,
    }]);
    setMessage('');
  }

  return (
    <div className="flex h-full" style={{ background: 'white' }}>
      {/* Sidebar: channel list */}
      <aside className="w-52 shrink-0 border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
        <div className="border-b px-3 py-3" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Oak Hills Chat
          </h2>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <input placeholder="Search..." className="w-full rounded-lg border px-2 py-1.5 text-sm outline-none focus:border-[#16A34A]"
            style={{ borderColor: 'var(--border)', background: 'white', color: 'var(--text-primary)' }} />
        </div>

        {/* Group channels */}
        <div className="px-3 pt-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Channels</div>
          {CHANNELS.map(ch => (
            <button key={ch.id} onClick={() => setActiveChannel(ch)}
              className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors text-left', activeChannel.id === ch.id ? 'bg-[#F0FDF4] text-[#16A34A] font-semibold' : 'hover:bg-[var(--bg-subtle)]')}
              style={activeChannel.id !== ch.id ? { color: 'var(--text-secondary)' } : undefined}>
              <Hash className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">{ch.name}</span>
              {ch.unread > 0 && (
                <span className="rounded-full bg-[#16A34A] px-1.5 py-0.5 text-[10px] font-bold text-white">{ch.unread}</span>
              )}
            </button>
          ))}
        </div>

        {/* DMs */}
        <div className="px-3 pt-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-tertiary)' }}>Direct</div>
          {DMS.map(dm => (
            <button key={dm.id} onClick={() => setActiveChannel(dm)}
              className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors', activeChannel.id === dm.id ? 'bg-[#F0FDF4] text-[#16A34A] font-semibold' : 'hover:bg-[var(--bg-subtle)]')}
              style={activeChannel.id !== dm.id ? { color: 'var(--text-secondary)' } : undefined}>
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-[9px] font-bold text-white">
                {initials(dm.name)}
              </div>
              <span className="flex-1 truncate">{dm.name}</span>
              {dm.unread > 0 && <span className="rounded-full bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-bold text-white">{dm.unread}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat thread */}
      <div className="flex flex-1 flex-col">
        {/* Thread header */}
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          {activeChannel.type === 'group' ? (
            <Hash className="h-5 w-5 text-[#16A34A]" />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16A34A] text-xs font-bold text-white">
              {initials(activeChannel.name)}
            </div>
          )}
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {activeChannel.name}
          </span>
          {activeChannel.type === 'group' && (
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>· 8 members</span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <MessageCircle className="h-10 w-10 mb-3 text-[var(--text-tertiary)]" />
              <p className="text-base" style={{ color: 'var(--text-secondary)' }}>No messages yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Be the first to say something!</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={cn('flex items-start gap-3', msg.isMine && 'flex-row-reverse')}>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: AVATAR_COLORS[msg.initials] ?? '#78716C' }}
              >
                {msg.initials === 'YO' ? 'Me' : msg.initials}
              </div>
              <div className={cn('max-w-[70%]', msg.isMine && 'items-end flex flex-col')}>
                <div className={cn('flex items-baseline gap-2 mb-1', msg.isMine && 'flex-row-reverse')}>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {msg.isMine ? 'You' : msg.sender}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{msg.time}</span>
                </div>
                <div
                  className={cn('rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed', msg.isMine ? 'rounded-tr-md' : 'rounded-tl-md')}
                  style={msg.isMine ? { background: '#16A34A', color: 'white' } : { background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Message input */}
        <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border)' }}>
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
            <input
              type="text" value={message} onChange={e => setMessage(e.target.value)}
              placeholder={`Message ${activeChannel.type === 'group' ? '#' + activeChannel.name : activeChannel.name}...`}
              className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit" disabled={!message.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-white transition-all hover:bg-[#15803D] active:scale-[0.95] disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
