import { useAppStore } from '@/stores/app-store';
import { useState } from 'react';
import {
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Plus,
  FileText,
  Cpu,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  components?: Array<{
    name: string;
    manufacturer: string;
    specs: string;
    price: string;
    package: string;
  }>;
}

const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    role: 'ai',
    content: 'How can I help with your design? I can suggest components, review your schematic, or help optimize your BOM.',
  },
  {
    id: 'm2',
    role: 'user',
    content: 'I need a voltage regulator that takes 12V input and gives me 3.3V at 500mA, low noise for an ADC reference.',
  },
  {
    id: 'm3',
    role: 'ai',
    content: 'For a low-noise 3.3V regulator with 12V input, I recommend:',
    components: [
      {
        name: 'ADP3338AKCZ-3.3',
        manufacturer: 'Analog Devices',
        specs: '1A, 190mV dropout, PSRR: 60dB @ 1kHz, Noise: 50uV RMS',
        price: '$1.85 @ DigiKey',
        package: 'SOIC-8',
      },
      {
        name: 'TPS7A3001DGNR',
        manufacturer: 'Texas Instruments',
        specs: '200mA, 300mV dropout, PSRR: 72dB @ 1kHz, Noise: 15uV RMS',
        price: '$2.40 @ DigiKey',
        package: 'SOT-23-5',
      },
    ],
  },
];

const quickActions = [
  'Suggest bypass caps for U1',
  'Review my schematic for errors',
  'Optimize BOM cost',
];

export function AIPanel() {
  const { aiPanelOpen, toggleAIPanel } = useAppStore();
  const [messages] = useState(initialMessages);
  const [input, setInput] = useState('');

  if (!aiPanelOpen) return null;

  return (
    <div className="flex w-80 flex-col border-l border-border-default bg-bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-copper" />
          <h3 className="text-xs font-medium text-text-primary">AI Assistant</h3>
        </div>
        <button onClick={toggleAIPanel} className="text-text-tertiary hover:text-text-secondary">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.role === 'user' ? 'flex justify-end' : ''}>
            {msg.role === 'ai' ? (
              <div>
                <div className="mb-1 flex items-center gap-1 text-[10px] text-copper">
                  <Sparkles className="h-2.5 w-2.5" />
                  AI
                </div>
                <div className="rounded-lg bg-bg-surface-raised p-3 text-xs text-text-secondary leading-relaxed">
                  {msg.content}
                  {msg.components && (
                    <div className="mt-3 space-y-3">
                      {msg.components.map((comp, i) => (
                        <div key={i} className="rounded-md border border-border-default bg-bg-surface p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-medium text-text-primary">{comp.name}</span>
                            <span className="text-[10px] text-text-tertiary">{comp.package}</span>
                          </div>
                          <div className="text-[10px] text-copper">{comp.manufacturer}</div>
                          <div className="mt-1 text-[10px] text-text-tertiary">{comp.specs}</div>
                          <div className="mt-1 font-mono text-[10px] text-primary">{comp.price}</div>
                          <div className="mt-2 flex items-center gap-1.5">
                            <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-primary hover:bg-primary/10">
                              <Plus className="h-2.5 w-2.5" />
                              Add to Schematic
                            </button>
                            <button className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-accent hover:bg-accent/10">
                              <FileText className="h-2.5 w-2.5" />
                              Datasheet
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.components && (
                  <div className="mt-2 flex items-center gap-2">
                    <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-hover hover:text-success">
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button className="rounded p-1 text-text-tertiary hover:bg-bg-surface-hover hover:text-error">
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-[85%] rounded-lg bg-accent/10 px-3 py-2 text-xs text-text-primary">
                {msg.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border-subtle px-4 py-2">
        <div className="mb-1.5 text-[10px] text-text-tertiary">Quick Actions:</div>
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action) => (
            <button
              key={action}
              className="rounded-full border border-border-default px-2.5 py-1 text-[10px] text-text-secondary hover:bg-bg-surface-hover"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border-subtle p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            rows={2}
            className="flex-1 resize-none rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
          <button className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-text-on-color hover:bg-primary-active">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
