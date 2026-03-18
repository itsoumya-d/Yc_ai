'use client';

import { useState, useEffect, use } from 'react';
import { getPublicStory } from '@/lib/actions/sharing';
import { getGenreLabel, getGenreEmoji, formatWordCount, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type StoryData = {
  story: {
    id: string;
    title: string;
    description: string | null;
    genre: string;
    status: string;
    author_name: string | null;
    author_pen_name: string | null;
    tags: string[] | null;
    updated_at: string;
  };
  chapters: {
    id: string;
    title: string;
    content: string;
    word_count: number;
    order_index: number;
  }[];
};

interface ReadingPrefs {
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
  theme: 'default' | 'sepia' | 'dark' | 'paper';
  fontFamily: 'sans' | 'serif' | 'mono';
  contentWidth: 'narrow' | 'normal' | 'wide';
}

const DEFAULT_PREFS: ReadingPrefs = {
  fontSize: 'md',
  lineHeight: 'relaxed',
  theme: 'default',
  fontFamily: 'serif',
  contentWidth: 'normal',
};

const FONT_SIZE_MAP = { sm: 16, md: 18, lg: 20, xl: 24 } as const;
const LINE_HEIGHT_MAP = { tight: 1.4, normal: 1.6, relaxed: 1.8, loose: 2.0 } as const;
const CONTENT_WIDTH_MAP = { narrow: 'max-w-xl', normal: 'max-w-2xl', wide: 'max-w-4xl' } as const;
const FONT_FAMILY_MAP = {
  sans: 'system-ui, -apple-system, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
} as const;

const THEME_MAP = {
  default: { bg: '#ffffff', text: '#1a1a1a', headerBg: '#ffffff', border: '#e5e7eb' },
  sepia: { bg: '#f4ecd8', text: '#5c4a2a', headerBg: '#ede0c8', border: '#d6c9a8' },
  dark: { bg: '#1a1a2e', text: '#e0e0e0', headerBg: '#12122a', border: '#2d2d4a' },
  paper: { bg: '#fafaf7', text: '#2c2c2c', headerBg: '#f5f5f0', border: '#e0e0d8' },
} as const;

// ─── Reading Preferences Panel ─────────────────────────────────────────────────

function ReadingPrefsPanel({
  prefs,
  onChange,
  onClose,
  theme,
}: {
  prefs: ReadingPrefs;
  onChange: (p: ReadingPrefs) => void;
  onClose: () => void;
  theme: (typeof THEME_MAP)[keyof typeof THEME_MAP];
}) {
  const panelStyle = {
    backgroundColor: theme.bg,
    color: theme.text,
    borderColor: theme.border,
  };

  const labelStyle = { color: theme.text, opacity: 0.6 };
  const activeBtn = { backgroundColor: theme.text, color: theme.bg };
  const inactiveBtn = { border: `1px solid ${theme.border}`, color: theme.text, opacity: 0.7 };

  function btn(active: boolean) {
    return active ? activeBtn : inactiveBtn;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      style={panelStyle}
      className="fixed bottom-20 right-4 z-50 w-72 rounded-2xl border shadow-2xl p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: theme.text }}>Reading Preferences</span>
        <button
          onClick={onClose}
          className="rounded-full p-1 transition-colors"
          style={{ color: theme.text, opacity: 0.5 }}
          aria-label="Close reading preferences"
        >
          <X size={14} />
        </button>
      </div>

      {/* Font Size */}
      <div>
        <p className="text-xs font-medium mb-2" style={labelStyle}>Font Size</p>
        <div className="flex gap-1">
          {(['sm', 'md', 'lg', 'xl'] as const).map((size, i) => {
            const labels = ['S', 'M', 'L', 'XL'];
            return (
              <button
                key={size}
                onClick={() => onChange({ ...prefs, fontSize: size })}
                className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all"
                style={btn(prefs.fontSize === size)}
              >
                {labels[i]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <p className="text-xs font-medium mb-2" style={labelStyle}>Line Spacing</p>
        <div className="flex gap-1">
          {(['tight', 'normal', 'relaxed', 'loose'] as const).map((lh) => {
            const labels: Record<string, string> = {
              tight: 'Tight',
              normal: 'Normal',
              relaxed: 'Relaxed',
              loose: 'Loose',
            };
            return (
              <button
                key={lh}
                onClick={() => onChange({ ...prefs, lineHeight: lh })}
                className="flex-1 rounded-lg py-1.5 text-[10px] font-medium transition-all"
                style={btn(prefs.lineHeight === lh)}
              >
                {labels[lh]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Theme */}
      <div>
        <p className="text-xs font-medium mb-2" style={labelStyle}>Theme</p>
        <div className="flex gap-2">
          {(['default', 'sepia', 'dark', 'paper'] as const).map((t) => {
            const colors = THEME_MAP[t];
            const isActive = prefs.theme === t;
            return (
              <button
                key={t}
                onClick={() => onChange({ ...prefs, theme: t })}
                title={t.charAt(0).toUpperCase() + t.slice(1)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: colors.bg,
                  border: isActive
                    ? `3px solid ${theme.text}`
                    : `2px solid ${theme.border}`,
                  boxShadow: isActive ? '0 0 0 2px ' + colors.bg + ', 0 0 0 4px ' + theme.text : 'none',
                }}
              >
                <span className="text-[10px] font-bold" style={{ color: colors.text }}>
                  Aa
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <p className="text-xs font-medium mb-2" style={labelStyle}>Font Family</p>
        <div className="flex gap-1">
          {(['sans', 'serif', 'mono'] as const).map((ff) => {
            const labels = { sans: 'Sans', serif: 'Serif', mono: 'Mono' };
            return (
              <button
                key={ff}
                onClick={() => onChange({ ...prefs, fontFamily: ff })}
                className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all"
                style={{ ...btn(prefs.fontFamily === ff), fontFamily: FONT_FAMILY_MAP[ff] }}
              >
                {labels[ff]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Width */}
      <div>
        <p className="text-xs font-medium mb-2" style={labelStyle}>Width</p>
        <div className="flex gap-1">
          {(['narrow', 'normal', 'wide'] as const).map((w) => {
            const labels = { narrow: 'Narrow', normal: 'Normal', wide: 'Wide' };
            return (
              <button
                key={w}
                onClick={() => onChange({ ...prefs, contentWidth: w })}
                className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all"
                style={btn(prefs.contentWidth === w)}
              >
                {labels[w]}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function PublicStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [data, setData] = useState<StoryData | null>(null);
  const [notFoundError, setNotFoundError] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [prefs, setPrefs] = useState<ReadingPrefs>(DEFAULT_PREFS);
  const [showPrefs, setShowPrefs] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load story data
  useEffect(() => {
    async function loadData() {
      const result = await getPublicStory(id);
      if (result.error || !result.data) {
        setNotFoundError(true);
        return;
      }
      setData(result.data as StoryData);
    }
    loadData();
  }, [id]);

  // Load saved preferences from localStorage (SSR-safe)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('storythread_reading_prefs');
      if (saved) {
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(saved) });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('storythread_reading_prefs', JSON.stringify(prefs));
    } catch {
      // ignore storage errors
    }
  }, [prefs, mounted]);

  // Scroll progress tracking
  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Close prefs panel on outside click
  useEffect(() => {
    if (!showPrefs) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-prefs-panel]') && !target.closest('[data-prefs-btn]')) {
        setShowPrefs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPrefs]);

  if (notFoundError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Story not found.</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );
  }

  const { story, chapters } = data;
  const author = story.author_pen_name || story.author_name || 'Anonymous';
  const totalWords = chapters.reduce((sum, ch) => sum + ch.word_count, 0);
  const estimatedReadTime = Math.max(1, Math.ceil(totalWords / 250));
  const theme = THEME_MAP[prefs.theme];

  const contentStyle: React.CSSProperties = {
    fontSize: `${FONT_SIZE_MAP[prefs.fontSize]}px`,
    lineHeight: LINE_HEIGHT_MAP[prefs.lineHeight],
    fontFamily: FONT_FAMILY_MAP[prefs.fontFamily],
    color: theme.text,
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', transition: 'background-color 0.3s, color 0.3s' }}>
      {/* ── Reading Progress Bar ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: `${readProgress}%`,
          height: '3px',
          background: prefs.theme === 'dark'
            ? 'linear-gradient(90deg, #818cf8, #c084fc)'
            : 'linear-gradient(90deg, #f97316, #ec4899)',
          zIndex: 60,
          transition: 'width 0.1s linear',
        }}
      />

      {/* ── Header ── */}
      <header
        style={{
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.headerBg,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div className={`mx-auto ${CONTENT_WIDTH_MAP[prefs.contentWidth]} px-6 py-3 flex items-center justify-between`}>
          <a
            href="/"
            className="text-sm font-medium transition-colors"
            style={{ color: theme.text, opacity: 0.5 }}
          >
            StoryThread
          </a>
          <span className="text-xs" style={{ color: theme.text, opacity: 0.4 }}>
            {getGenreLabel(story.genre)}
          </span>
        </div>
      </header>

      {/* ── Story Header ── */}
      <div className={`mx-auto ${CONTENT_WIDTH_MAP[prefs.contentWidth]} px-6 pt-16 pb-12`}>
        <div className="text-center">
          <span className="text-4xl mb-4 block">{getGenreEmoji(story.genre)}</span>
          <h1
            className="text-4xl font-bold leading-tight"
            style={{ color: theme.text, fontFamily: FONT_FAMILY_MAP[prefs.fontFamily] }}
          >
            {story.title}
          </h1>
          {story.description && (
            <p
              className="mt-4 text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: theme.text, opacity: 0.7 }}
            >
              {story.description}
            </p>
          )}
          <div
            className="mt-6 flex items-center justify-center flex-wrap gap-3 text-sm"
            style={{ color: theme.text, opacity: 0.55 }}
          >
            <span>
              by <span className="font-medium" style={{ color: theme.text, opacity: 1 }}>{author}</span>
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>{formatWordCount(totalWords)} words</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: prefs.theme === 'dark' ? '#2d2d4a' : '#f3f4f6', color: theme.text }}
            >
              Est. reading time: {estimatedReadTime} min
            </span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>{chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}</span>
          </div>
          {story.tags && story.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded-full px-3 py-1 text-xs"
                  style={{
                    backgroundColor: prefs.theme === 'dark' ? '#2d2d4a' : '#f3f4f6',
                    color: theme.text,
                    opacity: 0.8,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Table of Contents ── */}
      {chapters.length > 1 && (
        <nav className={`mx-auto ${CONTENT_WIDTH_MAP[prefs.contentWidth]} px-6 pb-12`}>
          <div
            className="rounded-lg p-6"
            style={{ border: `1px solid ${theme.border}`, backgroundColor: theme.headerBg }}
          >
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: theme.text, opacity: 0.5 }}
            >
              Table of Contents
            </h2>
            <ol className="space-y-2">
              {chapters.map((chapter, i) => (
                <li key={chapter.id}>
                  <a
                    href={`#chapter-${i + 1}`}
                    className="flex items-center justify-between py-1.5 text-sm transition-opacity hover:opacity-100"
                    style={{ color: theme.text, opacity: 0.75 }}
                  >
                    <span>
                      <span style={{ opacity: 0.4 }} className="mr-2">{i + 1}.</span>
                      {chapter.title}
                    </span>
                    <span className="text-xs ml-4 shrink-0" style={{ opacity: 0.4 }}>
                      {formatWordCount(chapter.word_count)} words
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      {/* ── Chapters ── */}
      <div className={`mx-auto ${CONTENT_WIDTH_MAP[prefs.contentWidth]} px-6 pb-32`}>
        {chapters.length === 0 ? (
          <div className="text-center py-16" style={{ color: theme.text, opacity: 0.5 }}>
            <p>This story has no published chapters yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {chapters.map((chapter, i) => {
              const chapterWords = chapter.word_count || chapter.content.split(/\s+/).filter(Boolean).length;
              const chapterReadTime = Math.max(1, Math.ceil(chapterWords / 250));

              return (
                <article
                  key={chapter.id}
                  id={`chapter-${i + 1}`}
                  className="scroll-mt-16"
                  style={contentStyle}
                >
                  <div className="mb-8 text-center">
                    <span
                      className="text-xs font-semibold uppercase tracking-widest"
                      style={{ color: theme.text, opacity: 0.4 }}
                    >
                      Chapter {i + 1}
                    </span>
                    <h2
                      className="mt-2 text-2xl font-bold"
                      style={{ color: theme.text, fontFamily: FONT_FAMILY_MAP[prefs.fontFamily] }}
                    >
                      {chapter.title}
                    </h2>
                    <p className="mt-1 text-xs" style={{ color: theme.text, opacity: 0.4 }}>
                      {chapterWords.toLocaleString()} words · {chapterReadTime} min read
                    </p>
                  </div>

                  <div>
                    {chapter.content.split('\n\n').map((paragraph, pi) =>
                      paragraph.trim() ? (
                        <p
                          key={pi}
                          className="mb-5"
                          style={{ color: theme.text, fontSize: contentStyle.fontSize, lineHeight: contentStyle.lineHeight }}
                        >
                          {paragraph}
                        </p>
                      ) : null
                    )}
                  </div>

                  {i < chapters.length - 1 && (
                    <div className="mt-12 flex items-center justify-center gap-2">
                      <span className="h-px w-12" style={{ backgroundColor: theme.border }} />
                      <span className="text-lg" style={{ color: theme.border }}>*</span>
                      <span className="h-px w-12" style={{ backgroundColor: theme.border }} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: `1px solid ${theme.border}`,
          backgroundColor: theme.headerBg,
          paddingTop: '2rem',
          paddingBottom: '2rem',
        }}
      >
        <div
          className={`mx-auto ${CONTENT_WIDTH_MAP[prefs.contentWidth]} px-6 text-center text-sm`}
          style={{ color: theme.text, opacity: 0.5 }}
        >
          <p>&ldquo;{story.title}&rdquo; by {author}</p>
          <p className="mt-1">
            Published on {formatDate(story.updated_at)} &middot; Written on{' '}
            <a href="/" style={{ color: theme.text, opacity: 0.8 }} className="underline">
              StoryThread
            </a>
          </p>
        </div>
      </footer>

      {/* ── Floating "Aa" Reading Preferences Button ── */}
      <div data-prefs-btn className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPrefs((v) => !v)}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center font-bold text-sm transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: theme.text,
            color: theme.bg,
          }}
          aria-label="Reading preferences"
        >
          Aa
        </button>
      </div>

      {/* ── Reading Preferences Panel ── */}
      <AnimatePresence>
        {showPrefs && mounted && (
          <div data-prefs-panel>
            <ReadingPrefsPanel
              prefs={prefs}
              onChange={setPrefs}
              onClose={() => setShowPrefs(false)}
              theme={theme}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
