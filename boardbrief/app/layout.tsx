import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ToastProvider } from '@/components/ui/toast';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'BoardBrief - AI Board Meeting Preparation', template: '%s | BoardBrief' },
  description: 'AI-powered board meeting preparation platform for startup founders. Auto-generate board decks, track action items, and manage resolutions.',
  keywords: ['board meetings', 'startup', 'board deck', 'investor updates', 'meeting minutes', 'AI'],
  openGraph: {
    title: 'BoardBrief - AI Board Meeting Preparation',
    description: 'Auto-generate board decks, track action items, and manage board meetings with AI.',
    type: 'website',
    url: 'https://boardbrief.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BoardBrief - AI Board Meeting Preparation',
    description: 'Auto-generate board decks and manage board meetings with AI.',
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "BoardBrief",
          "description": "AI-powered board meeting management platform for executive teams.",
          "url": "https://boardbrief.app",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
          }
}) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider><PostHogProvider><ToastProvider>{children}</ToastProvider></PostHogProvider></ThemeProvider>
        </NextIntlClientProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
