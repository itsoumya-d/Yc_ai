'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Star, Clock, DollarSign, Loader2, Phone, Calendar,
  ChevronDown, ChevronUp, FileText, X, Check,
} from 'lucide-react';
import { getAvailableVets } from '@/lib/actions/telehealth';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type Vet = {
  id: string;
  name: string;
  specialty: string | null;
  price_per_consultation: number | null;
  next_available_at: string | null;
  avatar_url: string | null;
  rating: number | null;
  reviews_count: number | null;
  bio: string | null;
};

type CallState = 'idle' | 'connecting' | 'connected';

type SlotKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
type Period = 'morning' | 'afternoon';

type ConsultationSummary = {
  chiefComplaint: string;
  assessment: string;
  treatmentPlan: string;
  followUp: string;
};

type PastConsultation = {
  id: string;
  vet: string;
  specialty: string;
  date: string;
  petName: string;
  duration: string;
  summary: ConsultationSummary;
};

// ─── Demo Data ─────────────────────────────────────────────────────────────────

const DEMO_VETS: Vet[] = [
  {
    id: 'demo-1',
    name: 'Dr. Sarah Chen',
    specialty: 'General Practice',
    price_per_consultation: 45,
    next_available_at: null,
    avatar_url: null,
    rating: 4.9,
    reviews_count: 128,
    bio: 'Board-certified with 12 years of companion animal care experience.',
  },
  {
    id: 'demo-2',
    name: 'Dr. Emily Park',
    specialty: 'Dermatology',
    price_per_consultation: 55,
    next_available_at: new Date(Date.now() + 86400000).toISOString(),
    avatar_url: null,
    rating: 4.8,
    reviews_count: 94,
    bio: 'Specialist in pet skin conditions, allergies, and coat health.',
  },
  {
    id: 'demo-3',
    name: 'Dr. Marcus Webb',
    specialty: 'Internal Medicine',
    price_per_consultation: 65,
    next_available_at: null,
    avatar_url: null,
    rating: 5.0,
    reviews_count: 62,
    bio: 'Expert in complex medical conditions and chronic disease management.',
  },
];

const DAYS: { key: SlotKey; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
];

const PAST_CONSULTATIONS: PastConsultation[] = [
  {
    id: 'pc-1',
    vet: 'Dr. Sarah Chen',
    specialty: 'General Practice',
    date: 'Feb 20, 2026',
    petName: 'Mochi',
    duration: '22 min',
    summary: {
      chiefComplaint: 'Owner reports 3-day history of decreased appetite and mild lethargy in a 3-year-old mixed breed dog.',
      assessment: 'Mild gastrointestinal upset, likely dietary indiscretion. No signs of systemic illness. Hydration status adequate.',
      treatmentPlan: 'Bland diet (boiled chicken and rice) for 3–5 days. Probiotics recommended. Monitor for vomiting, diarrhea, or worsening lethargy.',
      followUp: 'Return visit in 5 days if no improvement, or sooner if symptoms worsen.',
    },
  },
  {
    id: 'pc-2',
    vet: 'Dr. Emily Park',
    specialty: 'Dermatology',
    date: 'Jan 8, 2026',
    petName: 'Mochi',
    duration: '18 min',
    summary: {
      chiefComplaint: 'Recurrent itching, localized to ears and paws. Owner reports excessive licking and head shaking over past 2 weeks.',
      assessment: 'Presentation consistent with environmental allergies and secondary yeast otitis. Seasonal pattern noted.',
      treatmentPlan: 'Antifungal ear drops (Mometamax) twice daily for 7 days. Hypoallergenic shampoo weekly. Antihistamine (Zyrtec) 5mg daily as needed.',
      followUp: 'Allergen testing recommended if symptoms recur. Follow-up in 2 weeks for ear re-check.',
    },
  },
];

// ─── Star Rating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={
            i < full
              ? 'text-amber-400 fill-amber-400'
              : half && i === full
                ? 'text-amber-400 fill-amber-200'
                : 'text-gray-200 fill-gray-200'
          }
        />
      ))}
    </span>
  );
}

// ─── Availability Calendar ─────────────────────────────────────────────────────

function AvailabilityCalendar({ vetId }: { vetId: string }) {
  const [selectedDay, setSelectedDay] = useState<SlotKey | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);
  const [booked, setBooked] = useState(false);

  // Generate deterministic slot availability per vet
  const slots: Record<SlotKey, Record<Period, boolean>> = {
    mon: { morning: vetId !== 'demo-2', afternoon: true },
    tue: { morning: true, afternoon: vetId !== 'demo-3' },
    wed: { morning: vetId === 'demo-1', afternoon: true },
    thu: { morning: true, afternoon: vetId !== 'demo-1' },
    fri: { morning: true, afternoon: true },
  };

  function handleBook() {
    if (!selectedDay || !selectedPeriod) return;
    setBooked(true);
    setTimeout(() => setBooked(false), 3000);
    setSelectedDay(null);
    setSelectedPeriod(null);
  }

  return (
    <div className="mt-4 border-t border-border-default pt-4">
      <p className="text-xs font-medium text-text-secondary mb-3 flex items-center gap-1.5">
        <Calendar size={12} /> Schedule appointment
      </p>
      <div className="grid grid-cols-5 gap-1 mb-3">
        {DAYS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setSelectedDay(key); setSelectedPeriod(null); }}
            className={cn(
              'rounded-lg py-2 text-xs font-medium transition-all',
              selectedDay === key
                ? 'bg-primary text-white'
                : 'bg-gray-50 text-text-secondary hover:bg-primary/10 hover:text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mb-3">
              {(['morning', 'afternoon'] as Period[]).map((period) => {
                const available = slots[selectedDay][period];
                return (
                  <button
                    key={period}
                    disabled={!available}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      'flex-1 rounded-lg py-2 text-xs font-medium transition-all',
                      !available && 'opacity-30 cursor-not-allowed',
                      selectedPeriod === period
                        ? 'bg-primary text-white'
                        : available
                          ? 'bg-gray-50 text-text-secondary hover:bg-primary/10 hover:text-primary'
                          : 'bg-gray-50 text-text-tertiary'
                    )}
                  >
                    {period === 'morning' ? '9 AM – 12 PM' : '1 PM – 5 PM'}
                  </button>
                );
              })}
            </div>

            {selectedPeriod && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleBook}
                className="w-full rounded-lg bg-primary text-white py-2 text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Confirm Appointment
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {booked && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-green-600 text-xs font-medium mt-2"
          >
            <Check size={14} /> Appointment booked! You'll receive a confirmation email.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Video Call UI ─────────────────────────────────────────────────────────────

function VideoCallUI({
  vet,
  onEnd,
}: {
  vet: Vet;
  onEnd: () => void;
}) {
  const [callState, setCallState] = useState<CallState>('connecting');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const initials = vet.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  // Simulate connection after 2 seconds
  useEffect(() => {
    const t = setTimeout(() => setCallState('connected'), 2000);
    return () => clearTimeout(t);
  }, []);

  // Call timer
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* ── Connecting State ── */}
      <AnimatePresence>
        {callState === 'connecting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#0d0d1a]"
          >
            <div className="relative mb-6">
              {/* Pulsing rings */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/30"
                style={{ margin: '-24px' }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                className="absolute inset-0 rounded-full bg-primary/20"
                style={{ margin: '-12px' }}
              />
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/40">
                {initials}
              </div>
            </div>
            <p className="text-white text-lg font-semibold mb-2">{vet.name}</p>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Connecting...
            </p>
            <button
              onClick={onEnd}
              className="mt-8 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
            >
              <X size={16} /> Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Connected State ── */}
      <AnimatePresence>
        {callState === 'connected' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col relative"
          >
            {/* Remote video (vet) */}
            <div className="flex-1 bg-[#0d0d1a] flex items-center justify-center relative">
              {/* Vet avatar/placeholder */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold border-2 border-primary/40">
                  {initials}
                </div>
                <p className="text-gray-300 text-sm">{vet.name}</p>
              </div>

              {/* Top overlay: timer + vet name */}
              <div className="absolute top-4 left-4 flex items-center gap-3">
                <span className="bg-black/60 text-white text-xs font-mono px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {formatTime(elapsed)}
                </span>
                <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {vet.name} · {vet.specialty}
                </span>
              </div>

              {/* Live badge */}
              <div className="absolute top-4 right-4">
                <span className="flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Your video (PiP) */}
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl bg-[#1e1e30] border border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                {cameraOn ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                      You
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <Video size={14} className="text-gray-400" />
                    </div>
                    <span className="text-gray-500 text-[10px]">Camera off</span>
                  </div>
                )}
                <span className="absolute bottom-1.5 left-2 text-white/60 text-[10px]">You</span>
              </div>
            </div>

            {/* Control bar */}
            <div className="bg-[#1a1a2e] border-t border-white/5 px-6 py-4 flex items-center justify-center gap-4">
              {/* Mic */}
              <button
                onClick={() => setMuted((m) => !m)}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                  muted ? 'bg-red-600 hover:bg-red-700' : 'bg-white/10 hover:bg-white/20'
                )}
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
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
                  !cameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-white/10 hover:bg-white/20'
                )}
                title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraOn ? (
                  <Video size={20} className="text-white" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
                    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>

              {/* End call */}
              <button
                onClick={onEnd}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all shadow-lg"
                title="End call"
                aria-label="End call"
              >
                <Phone size={22} className="text-white rotate-[135deg]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Visit Summary Panel ───────────────────────────────────────────────────────

function VisitSummaryPanel({
  consultation,
  onClose,
}: {
  consultation: PastConsultation;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-border-default space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <FileText size={12} />
            AI-Generated Visit Summary
          </h4>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary" aria-label="Close summary">
            <X size={14} />
          </button>
        </div>

        {[
          { label: 'Chief Complaint', value: consultation.summary.chiefComplaint },
          { label: 'Assessment', value: consultation.summary.assessment },
          { label: 'Treatment Plan', value: consultation.summary.treatmentPlan },
          { label: 'Follow-up', value: consultation.summary.followUp },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary mb-0.5">
              {label}
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function TelehealthPage() {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCallVet, setActiveCallVet] = useState<Vet | null>(null);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getAvailableVets();
    setVets(data as Vet[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const displayVets: Vet[] = vets.length > 0 ? vets : DEMO_VETS;

  const formatAvailability = (iso: string | null) => {
    if (!iso) return 'Today 3:00 PM';
    const d = new Date(iso);
    const diffH = Math.floor((d.getTime() - Date.now()) / 3600000);
    if (diffH <= 0) return 'Today 3:00 PM';
    if (diffH < 24) return `Today in ${diffH}h`;
    return `${d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* ── Video Call Overlay ── */}
      <AnimatePresence>
        {activeCallVet && (
          <VideoCallUI
            vet={activeCallVet}
            onEnd={() => setActiveCallVet(null)}
          />
        )}
      </AnimatePresence>

      <div className="space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Telehealth Consultations</h1>
          <p className="text-sm text-text-secondary mt-1">Video call with licensed vets — no travel needed.</p>
        </div>

        {/* How it works banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Video size={20} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">How it works</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Click &quot;Start Call&quot; to open a private encrypted video room. Charged after the consultation.
            </p>
          </div>
        </div>

        {/* ── Available Vets ── */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Available Vets</h2>
          <div className="space-y-4">
            {displayVets.map((vet) => {
              const initials = vet.name.split(' ').map((n) => n[0]).join('').slice(0, 2);
              const isAvailableNow = !vet.next_available_at || new Date(vet.next_available_at) <= new Date();
              const showSchedule = expandedSchedule === vet.id;

              return (
                <motion.div
                  key={vet.id}
                  layout
                  className="bg-bg-surface border border-border-default rounded-xl p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-sm">
                      {initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="font-semibold text-text-primary">{vet.name}</h3>
                        <div className="flex items-center gap-2">
                          {/* Next available badge */}
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Next: {formatAvailability(vet.next_available_at)}
                          </span>
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded-full',
                              isAvailableNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            {isAvailableNow ? '● Online' : '○ Away'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary">{vet.specialty ?? 'General Practice'}</p>
                      {vet.bio && (
                        <p className="text-xs text-text-tertiary mt-1 leading-relaxed">{vet.bio}</p>
                      )}

                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {vet.rating !== null && (
                          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <StarRating rating={vet.rating} />
                            {vet.rating} ({vet.reviews_count ?? 0} reviews)
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                          <DollarSign size={12} />
                          ${vet.price_per_consultation ?? 45}/consultation
                        </span>
                        <span className="flex items-center gap-1 text-xs text-text-secondary">
                          <Clock size={12} />
                          {formatAvailability(vet.next_available_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setActiveCallVet(vet)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
                    >
                      <Video size={16} />
                      Start Video Call
                    </button>
                    <button
                      onClick={() =>
                        setExpandedSchedule(showSchedule ? null : vet.id)
                      }
                      className={cn(
                        'flex items-center gap-1.5 text-sm font-medium py-2.5 px-3 rounded-lg transition-colors border',
                        showSchedule
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-bg-surface border-border-default text-text-secondary hover:text-text-primary'
                      )}
                    >
                      <Calendar size={16} />
                      Schedule
                      {showSchedule ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* Availability calendar */}
                  <AnimatePresence>
                    {showSchedule && <AvailabilityCalendar key={vet.id} vetId={vet.id} />}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Past Consultations ── */}
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">
            Past Consultations
          </h2>
          <div className="space-y-3">
            {PAST_CONSULTATIONS.map((consultation) => {
              const showSummary = expandedSummary === consultation.id;
              return (
                <motion.div
                  key={consultation.id}
                  layout
                  className="bg-bg-surface border border-border-default rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Check size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {consultation.vet}
                        </p>
                        <p className="text-xs text-text-secondary">{consultation.specialty}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-text-tertiary">{consultation.date}</span>
                          <span className="text-xs text-text-tertiary">·</span>
                          <span className="text-xs text-text-tertiary">{consultation.petName}</span>
                          <span className="text-xs text-text-tertiary">·</span>
                          <span className="text-xs text-text-tertiary">{consultation.duration}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedSummary(showSummary ? null : consultation.id)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border shrink-0',
                        showSummary
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-bg-surface border-border-default text-text-secondary hover:text-text-primary'
                      )}
                    >
                      <FileText size={12} />
                      View Summary
                      {showSummary ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showSummary && (
                      <VisitSummaryPanel
                        consultation={consultation}
                        onClose={() => setExpandedSummary(null)}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
