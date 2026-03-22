'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'es', label: 'Espa\u00f1ol', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'hi', label: '\u0939\u093f\u0928\u094d\u0926\u0940', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'zh', label: '\u4e2d\u6587', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629', flag: '\u{1F1F8}\u{1F1E6}' },
  { code: 'pt', label: 'Portugu\u00eas', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'fr', label: 'Fran\u00e7ais', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'de', label: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'ja', label: '\u65e5\u672c\u8a9e', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'ko', label: '\ud55c\uad6d\uc5b4', flag: '\u{1F1F0}\u{1F1F7}' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find(l => l.code === locale) ?? LANGUAGES[0];

  const switchLocale = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code};path=/;max-age=31536000;SameSite=Lax`;
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-emerald-800 text-emerald-300 hover:text-white transition-colors"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="text-sm">{current.flag} {current.label}</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-full mb-2 left-0 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden"
            role="listbox"
            aria-label="Language options"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                  lang.code === locale
                    ? 'bg-emerald-700 text-white font-medium'
                    : 'text-[var(--muted-foreground)] hover:bg-emerald-800 hover:text-white'
                }`}
                role="option"
                aria-selected={lang.code === locale}
                dir={lang.code === 'ar' ? 'rtl' : 'ltr'}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
