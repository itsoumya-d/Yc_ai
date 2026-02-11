import { useState, useCallback, useEffect, useRef, KeyboardEvent } from 'react';
import { useAppStore } from '@/stores/app-store';
import { cn, getRiskColor, getRiskLabel } from '@/lib/utils';
import {
  getContractContent, saveContractContent,
  getRiskFindings, saveRiskFindings, resolveRiskFinding,
  getChatHistory, saveChatMessage, generateId,
} from '@/lib/storage';
import {
  analyzeContractRisks, askAboutContract, calculateRiskScore, getRiskLevelFromScore,
} from '@/lib/contract-ai';
import {
  Bold, Italic, Underline, Heading1, Heading2, List, Table, Library,
  Sparkles, AlertTriangle, Download, GitCompare, Check, X, Search, Send,
  PanelRightOpen, PanelRightClose, Loader2, ChevronDown, RefreshCw,
} from 'lucide-react';

const DEFAULT_CONTRACT = `MASTER SERVICE AGREEMENT

Between Acme Corp ("Client") and TechServ Inc ("Provider")

1. DEFINITIONS

1.1 "Agreement" means this Master Service Agreement, together with all exhibits, schedules, and statements of work incorporated herein by reference.

1.2 "Confidential Information" means any and all non-public information disclosed by either party to the other party, whether orally, in writing, or by any other means.

2. TERM AND TERMINATION

2.1 This Agreement shall commence on the Effective Date and continue for an initial term of twelve (12) months.

2.2 Either party may terminate this Agreement upon fifteen (15) days prior written notice to the other party.

3. SCOPE OF SERVICES

3.1 Provider shall perform the services described in each Statement of Work executed by the parties, including all deliverables and milestones set forth therein.

4. INDEMNIFICATION

4.1 Party A shall indemnify and hold harmless Party B from any and all claims, damages, losses, liabilities, costs, and expenses arising from this Agreement.

4.2 The indemnifying party shall bear all costs of defense, including reasonable attorney's fees.

5. LIMITATION OF LIABILITY

5.1 IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

6. INTELLECTUAL PROPERTY

6.1 All work product, inventions, and materials created by Provider in connection with this Agreement shall be assigned to and become the sole property of Client.

7. GOVERNING LAW

7.1 This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.`;

const clauseCategories = ['Indemnification', 'Limitation of Liability', 'Confidentiality', 'Termination', 'IP Assignment', 'Governing Law'];
const aiTabs = ['Suggestions', 'Clause Library', 'Ask'];

export function EditorView() {
  const {
    aiPanelOpen, toggleAIPanel,
    activeContractId, openaiApiKey,
    riskFindings, setRiskFindings,
    isAnalyzing, setIsAnalyzing,
    chatMessages, setChatMessages, addChatMessage,
    isChatLoading, setIsChatLoading,
    updateContract,
  } = useAppStore();

  const [trackChanges, setTrackChanges] = useState(true);
  const [activeAITab, setActiveAITab] = useState('Suggestions');
  const [content, setContent] = useState('');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load contract content and risk findings on mount or contract change
  useEffect(() => {
    const id = activeContractId || 'default';
    const saved = getContractContent(id);
    setContent(saved || DEFAULT_CONTRACT);

    const findings = getRiskFindings(id);
    setRiskFindings(findings);

    const chat = getChatHistory(id);
    setChatMessages(chat);
  }, [activeContractId, setRiskFindings, setChatMessages]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Save content on change
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    const id = activeContractId || 'default';
    saveContractContent(id, newContent);

    if (activeContractId) {
      const wordCount = newContent.split(/\s+/).filter(Boolean).length;
      updateContract(activeContractId, { word_count: wordCount, updated_at: new Date().toISOString() });
    }
  }, [activeContractId, updateContract]);

  // Run AI analysis
  const handleAnalyze = useCallback(async () => {
    if (!openaiApiKey) {
      setRiskFindings([{
        id: 'no-key',
        contract_id: activeContractId || 'default',
        section_ref: '',
        severity: 'info',
        title: 'API Key Required',
        explanation: 'Add your OpenAI API key in Settings → API Keys to enable AI contract analysis.',
        suggested_alternative: '',
        resolved: false,
      }]);
      return;
    }

    setIsAnalyzing(true);
    try {
      const id = activeContractId || 'default';
      const findings = await analyzeContractRisks(content, id, openaiApiKey);
      setRiskFindings(findings);
      saveRiskFindings(id, findings);

      if (activeContractId) {
        const score = calculateRiskScore(findings);
        const level = getRiskLevelFromScore(score);
        updateContract(activeContractId, { risk_score: score, risk_level: level });
      }
    } catch (err) {
      setRiskFindings([{
        id: 'error',
        contract_id: activeContractId || 'default',
        section_ref: '',
        severity: 'info',
        title: 'Analysis Error',
        explanation: err instanceof Error ? err.message : 'Failed to analyze contract.',
        suggested_alternative: '',
        resolved: false,
      }]);
    }
    setIsAnalyzing(false);
  }, [content, activeContractId, openaiApiKey, setRiskFindings, setIsAnalyzing, updateContract]);

  // Resolve a finding
  const handleResolve = useCallback((findingId: string) => {
    const id = activeContractId || 'default';
    resolveRiskFinding(id, findingId);
    setRiskFindings(getRiskFindings(id));
  }, [activeContractId, setRiskFindings]);

  // Ask a question
  const handleAsk = useCallback(async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { id: generateId(), role: 'user' as const, content: chatInput, timestamp: new Date().toISOString() };
    const id = activeContractId || 'default';
    addChatMessage(userMsg);
    saveChatMessage(id, userMsg);
    setChatInput('');

    if (!openaiApiKey) {
      const errMsg = { id: generateId(), role: 'assistant' as const, content: 'Please add your OpenAI API key in Settings → API Keys.', timestamp: new Date().toISOString() };
      addChatMessage(errMsg);
      saveChatMessage(id, errMsg);
      return;
    }

    setIsChatLoading(true);
    try {
      const history = chatMessages.map((m) => ({ role: m.role, content: m.content }));
      const answer = await askAboutContract(chatInput, content, history, openaiApiKey);
      const assistantMsg = { id: generateId(), role: 'assistant' as const, content: answer, timestamp: new Date().toISOString() };
      addChatMessage(assistantMsg);
      saveChatMessage(id, assistantMsg);
    } catch (err) {
      const errMsg = { id: generateId(), role: 'assistant' as const, content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`, timestamp: new Date().toISOString() };
      addChatMessage(errMsg);
      saveChatMessage(id, errMsg);
    }
    setIsChatLoading(false);
  }, [chatInput, content, chatMessages, activeContractId, openaiApiKey, addChatMessage, isChatLoading, setIsChatLoading]);

  const handleChatKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }, [handleAsk]);

  const unresolvedCount = riskFindings.filter((f) => !f.resolved).length;

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border-default bg-bg-surface px-4 py-2">
        <div className="flex items-center gap-1">
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Bold className="h-4 w-4" /></button>
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Italic className="h-4 w-4" /></button>
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Underline className="h-4 w-4" /></button>
          <div className="mx-1 h-4 w-px bg-border-default" />
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Heading1 className="h-4 w-4" /></button>
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Heading2 className="h-4 w-4" /></button>
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><List className="h-4 w-4" /></button>
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Table className="h-4 w-4" /></button>
          <div className="mx-1 h-4 w-px bg-border-default" />
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><Library className="h-4 w-4" /></button>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={cn('rounded p-1.5 transition-colors', isAnalyzing ? 'text-accent ai-processing' : 'text-text-tertiary hover:bg-bg-surface-raised hover:text-accent')}
            title="AI Analyze"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-accent" />}
          </button>
          <button className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-text-secondary"><AlertTriangle className="h-4 w-4" /></button>
          <div className="mx-1 h-4 w-px bg-border-default" />
          <button
            onClick={() => setTrackChanges(!trackChanges)}
            className={cn('rounded px-2 py-1 text-xs transition-colors', trackChanges ? 'bg-insertion/20 text-insertion' : 'text-text-tertiary hover:text-text-secondary')}
          >
            <GitCompare className="mr-1 inline h-3.5 w-3.5" />
            Track Changes
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded px-2 py-1 text-xs text-text-tertiary hover:text-text-secondary">
            <Download className="mr-1 inline h-3.5 w-3.5" />Export
          </button>
          <span className="rounded bg-bg-surface-raised px-2 py-0.5 text-[10px] text-text-tertiary">
            {content.split(/\s+/).filter(Boolean).length} words
          </span>
          {unresolvedCount > 0 && (
            <span className="rounded-full bg-risk-red-muted px-2 py-0.5 text-[10px] text-risk-red">
              {unresolvedCount} risk{unresolvedCount !== 1 ? 's' : ''}
            </span>
          )}
          <button onClick={toggleAIPanel} className="rounded p-1.5 text-text-tertiary hover:bg-bg-surface-raised hover:text-accent">
            {aiPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-auto bg-bg-paper p-8">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="mx-auto block w-full max-w-[680px] min-h-full resize-none bg-transparent contract-body text-text-secondary focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* AI Panel */}
        {aiPanelOpen && (
          <div className="w-80 shrink-0 border-l border-border-default bg-bg-surface flex flex-col">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">AI Assistant</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="rounded p-1 text-text-tertiary hover:text-accent"
                title="Re-analyze"
              >
                {isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border-default px-4 py-1.5">
              {aiTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveAITab(tab)}
                  className={cn(
                    'rounded px-2.5 py-1 text-xs transition-colors',
                    activeAITab === tab ? 'bg-bg-surface-raised text-text-primary' : 'text-text-tertiary hover:text-text-secondary',
                  )}
                >
                  {tab}
                  {tab === 'Suggestions' && unresolvedCount > 0 && (
                    <span className="ml-1 rounded-full bg-risk-red-muted px-1.5 text-[10px] text-risk-red">{unresolvedCount}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto">
              {/* Suggestions Tab */}
              {activeAITab === 'Suggestions' && (
                <div className="divide-y divide-border-muted">
                  {riskFindings.length === 0 && !isAnalyzing && (
                    <div className="p-4 text-center">
                      <Sparkles className="mx-auto mb-2 h-6 w-6 text-text-tertiary" />
                      <p className="text-xs text-text-secondary">Click the ✨ button to analyze this contract for risks.</p>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" />
                      <span className="text-xs text-text-secondary">Analyzing contract...</span>
                    </div>
                  )}
                  {riskFindings.map((s) => (
                    <div key={s.id} className={cn('p-4', s.resolved && 'opacity-50')}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="clause-id text-text-tertiary">{s.section_ref}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', getRiskColor(s.severity))}>
                          {getRiskLabel(s.severity)}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-text-primary">{s.title}</h4>
                      <p className="mt-1 text-xs text-text-secondary">{s.explanation}</p>
                      {s.suggested_alternative && !s.resolved && (
                        <>
                          <p className="mt-2 rounded bg-safe-green-muted p-2 text-xs text-text-secondary italic">&ldquo;{s.suggested_alternative}&rdquo;</p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => handleResolve(s.id)}
                              className="rounded bg-safe-green px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                            >
                              <Check className="mr-1 inline h-3 w-3" />Apply
                            </button>
                            <button
                              onClick={() => handleResolve(s.id)}
                              className="rounded border border-border-default px-2.5 py-1 text-xs text-text-tertiary hover:bg-bg-surface-raised"
                            >
                              <X className="mr-1 inline h-3 w-3" />Dismiss
                            </button>
                          </div>
                        </>
                      )}
                      {s.resolved && (
                        <span className="mt-1 inline-block text-[10px] text-safe-green">✓ Resolved</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Clause Library Tab */}
              {activeAITab === 'Clause Library' && (
                <div className="p-4 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
                    <input type="text" placeholder="Search clauses..." className="h-8 w-full rounded border border-border-default bg-bg-surface-raised pl-8 pr-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none" />
                  </div>
                  {clauseCategories.map((cat) => (
                    <button key={cat} className="flex w-full items-center justify-between rounded-md border border-border-default p-3 text-left text-xs transition-colors hover:border-accent">
                      <span className="text-text-primary">{cat}</span>
                      <ChevronDown className="h-3 w-3 text-text-tertiary" />
                    </button>
                  ))}
                </div>
              )}

              {/* Ask Tab */}
              {activeAITab === 'Ask' && (
                <div className="flex h-full flex-col">
                  <div className="flex-1 overflow-auto p-4 space-y-3">
                    {chatMessages.length === 0 && (
                      <div className="rounded-lg bg-bg-surface-raised p-3 text-xs text-text-secondary">
                        Ask me anything about this contract. I can summarize sections, identify risks, or answer specific questions.
                      </div>
                    )}
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'rounded-lg p-3 text-xs',
                          msg.role === 'user'
                            ? 'ml-4 bg-primary-muted text-text-primary'
                            : 'mr-4 bg-bg-surface-raised text-text-secondary',
                        )}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="mr-4 flex items-center gap-2 rounded-lg bg-bg-surface-raised p-3">
                        <Loader2 className="h-3 w-3 animate-spin text-accent" />
                        <span className="text-xs text-text-tertiary">Thinking...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t border-border-default p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleChatKeyDown}
                        placeholder="Ask about this contract..."
                        className="h-8 flex-1 rounded border border-border-default bg-bg-surface-raised px-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary-light focus:outline-none"
                      />
                      <button
                        onClick={handleAsk}
                        disabled={isChatLoading || !chatInput.trim()}
                        className="rounded bg-primary p-2 text-text-on-color hover:bg-primary-hover disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
