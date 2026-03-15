import type { Metadata } from 'next';
import { Inter, DM_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ToastProvider } from '@/components/ui/toast';
import { PostHogProvider } from '@/components/PostHogProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const dmMono = DM_Mono({ variable: '--font-dm-mono', subsets: ['latin'], display: 'swap', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: { default: 'ProposalPilot - AI-Powered Proposal Generation', template: '%s | ProposalPilot' },
  description: 'Win more deals with AI-powered proposal generation. Create professional proposals in minutes, track engagement, and close faster.',
  keywords: ['proposal generation', 'AI proposals', 'sales proposals', 'RFP response', 'business development'],
  openGraph: {
    title: 'ProposalPilot - AI-Powered Proposal Generation',
    description: 'Create winning proposals in minutes with AI-powered generation and engagement tracking.',
    type: 'website',
    url: 'https://proposalpilot.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProposalPilot - AI-Powered Proposal Generation',
    description: 'Create winning proposals in minutes with AI-powered generation.',
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
          "name": "ProposalPilot",
          "description": "AI-powered proposal generation platform. Create winning proposals in minutes.",
          "url": "https://proposalpilot.com",
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
      <body className={`${inter.variable} ${dmMono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider><PostHogProvider><ToastProvider>{children}</ToastProvider></PostHogProvider></ThemeProvider>
        </NextIntlClientProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
