'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Phone, Loader2, X, FileText, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type CallState = 'connecting' | 'connected' | 'ended';

const VET_INFO = {
  name: 'Dr. Sarah Chen',
  specialty: 'General Practice',
  initials: 'SC',
};

export default function VideoCallPage() {
  const router = useRouter();
  const [callState, setCallState] = useState<CallState>('connecting');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  // Simulate connection
  useEffect(() => {
    const t = setTimeout(() => setCallState('connected'), 2000);
    return () => clearTimeout(t);
  }, []);

  // Timer
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  function handleEnd() {
    setCallState('ended');
  }

  // ── Call Ended Summary ──────────────────────────────────────────────────────
  if (callState === 'ended') {
    return (
      <div className="space-y-6 max-w-lg">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Consultation Complete</h1>
          <p className="text-sm text-text-secondary mt-1">
            Your call with {VET_INFO.name} has ended.
          </p>
        </div>

        {/* Duration summary */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Video size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">Call completed</p>
              <p className="text-xs text-green-700 mt-0.5">
                Duration: {formatTime(elapsed)} · {VET_INFO.name}
              </p>
            </div>
          </div>
        </div>

        {/* AI-generated visit notes */}
        <div className="bg-bg-surface border border-border-default rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-text-primary">AI Visit Notes</h2>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Auto-generated
            </span>
          </div>

          {[
            {
              label: 'Chief Complaint',
              text: 'Owner reports 3-day history of decreased appetite and mild lethargy.',
            },
            {
              label: 'Assessment',
              text: 'Mild gastrointestinal upset, likely dietary indiscretion. No systemic illness signs. Hydration adequate.',
            },
            {
              label: 'Treatment Plan',
              text: 'Bland diet (boiled chicken and rice) for 3–5 days. Probiotics recommended. Monitor for vomiting or worsening lethargy.',
            },
            {
              label: 'Follow-up',
              text: 'Return visit in 5 days if no improvement, or sooner if symptoms worsen.',
            },
          ].map(({ label, text }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-0.5">
                {label}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/telehealth')}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Telehealth
        </button>
      </div>
    );
  }

  // ── Call Interface ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/telehealth')}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Telehealth Call</h1>
          <p className="text-xs text-text-secondary">
            {callState === 'connecting' ? 'Connecting...' : `In progress · ${formatTime(elapsed)}`}
          </p>
        </div>
      </div>

      {/* Video area */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0d0d1a] aspect-video w-full shadow-xl">
        {/* Connecting overlay */}
        <AnimatePresence>
          {callState === 'connecting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0d0d1a]"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-primary/30"
                  style={{ margin: '-28px' }}
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 rounded-full bg-primary/20"
                  style={{ margin: '-14px' }}
                />
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/40">
                  {VET_INFO.initials}
                </div>
              </div>
              <p className="text-white text-base font-semibold">{VET_INFO.name}</p>
              <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                <Loader2 size={13} className="animate-spin" />
                Connecting to your vet...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected state */}
        <AnimatePresence>
          {callState === 'connected' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Remote (vet) video placeholder */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/30">
                  {VET_INFO.initials}
                </div>
                <p className="text-gray-300 text-sm">{VET_INFO.name}</p>
                <p className="text-gray-500 text-xs">{VET_INFO.specialty}</p>
              </div>

              {/* Top HUD */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-black/60 text-white text-xs font-mono px-3 py-1 rounded-full backdrop-blur-sm">
                  {formatTime(elapsed)}
                </span>
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  {VET_INFO.name}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-medium px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* PiP self-view */}
              <div className="absolute bottom-3 right-3 w-28 h-20 rounded-xl bg-[#1e1e30] border border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                {cameraOn ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                      You
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Video size={14} className="text-gray-500" />
                    <span className="text-[10px] text-gray-500 mt-1">Off</span>
                  </div>
                )}
                <span className="absolute bottom-1 left-2 text-white/50 text-[10px]">You</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control bar */}
      {callState === 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 bg-bg-surface border border-border-default rounded-2xl p-4"
        >
          {/* Mute */}
          <button
            onClick={() => setMuted((m) => !m)}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all',
              muted ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-50 text-text-secondary hover:bg-gray-50/80'
            )}
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>

          {/* Camera */}
          <button
            onClick={() => setCameraOn((c) => !c)}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all',
              !cameraOn ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-50 text-text-secondary hover:bg-gray-50/80'
            )}
            title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? (
              <Video size={20} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            )}
          </button>

          {/* End call */}
          <button
            onClick={handleEnd}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-md"
            title="End call"
            aria-label="End call"
          >
            <Phone size={20} className="rotate-[135deg]" />
          </button>

          {/* Notes toggle */}
          <button
            onClick={() => setShowNotes((n) => !n)}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all',
              showNotes ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-gray-50 text-text-secondary hover:bg-gray-50/80'
            )}
            title="Visit notes"
          >
            <FileText size={18} />
          </button>
        </motion.div>
      )}

      {/* Inline notes panel */}
      <AnimatePresence>
        {showNotes && callState === 'connected' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-bg-surface border border-border-default rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <FileText size={14} className="text-primary" />
                  Live Visit Notes
                </h3>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-text-tertiary hover:text-text-secondary"
                >
                  <X size={14} />
                </button>
              </div>
              <textarea
                placeholder="Take notes during the consultation..."
                className="w-full min-h-[100px] text-sm text-text-primary bg-gray-50 rounded-lg p-3 border border-border-default resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-text-tertiary"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
