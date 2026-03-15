import type { Metadata } from 'next';
import { Source_Serif_4, Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/toast';
import { CookieBanner } from '@/components/CookieBanner';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'ClaimForge - AI Fraud Detection & FCA Intelligence', template: '%s | ClaimForge' },
  description: 'AI-powered fraud detection and False Claims Act investigation platform. Analyze documents, detect patterns, and build cases faster.',
  keywords: ['fraud detection', 'False Claims Act', 'FCA investigation', 'AI fraud', 'legal analytics'],
  openGraph: {
    title: 'ClaimForge - AI Fraud Detection & FCA Intelligence',
    description: 'Detect fraud patterns and build False Claims Act cases faster with AI.',
    type: 'website',
    url: 'https://claimforge.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClaimForge - AI Fraud Detection & FCA Intelligence',
    description: 'Detect fraud patterns and build False Claims Act cases faster with AI.',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning className={`${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ClaimForge",
          "description": "AI-powered insurance claims management platform for faster, smarter claim resolution.",
          "url": "https://claimforge.app",
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
      <body className="min-h-screen bg-bg-root text-text-primary antialiased">
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
