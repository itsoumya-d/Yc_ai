import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Lora } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ToastProvider } from '@/components/ui/toast';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'StoryThread - Collaborative Fiction Writing',
    template: '%s | StoryThread',
  },
  description: 'AI-powered collaborative fiction writing platform. Build characters, worlds, and stories with intelligent writing assistance.',
  keywords: ['fiction writing', 'collaborative writing', 'story builder', 'AI writing', 'character creation'],
  openGraph: {
    title: 'StoryThread - Collaborative Fiction Writing',
    description: 'Build characters, worlds, and stories with AI-powered writing assistance.',
    type: 'website',
    url: 'https://storythread.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StoryThread - Collaborative Fiction Writing',
    description: 'Build characters, worlds, and stories with AI-powered writing assistance.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
          "name": "StoryThread",
          "description": "AI-powered collaborative storytelling platform. Write, publish, and share stories with real-time co-authoring.",
          "url": "https://storythread.app",
          "applicationCategory": "WritingApplication",
          "operatingSystem": "Web",
          "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
          }
}) }}
        />
      </head>
      <body className={`${plusJakarta.variable} ${lora.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <PostHogProvider><ToastProvider>{children}</ToastProvider></PostHogProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
