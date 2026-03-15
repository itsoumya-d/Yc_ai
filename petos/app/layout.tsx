import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
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

export const metadata: Metadata = {
  title: { default: 'Petos - Smart Pet Care Management', template: '%s | Petos' },
  description: 'AI-powered pet health management. Track vaccinations, medications, appointments, and get AI symptom analysis for your furry friends.',
  keywords: ['pet health', 'pet care', 'vet directory', 'pet medications', 'telehealth', 'pet appointments'],
  openGraph: {
    title: 'Petos - Smart Pet Care Management',
    description: 'Track vaccinations, medications, and get AI symptom analysis for your pets.',
    type: 'website',
    url: 'https://petos.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Petos - Smart Pet Care Management',
    description: 'Track vaccinations, medications, and get AI symptom analysis for your pets.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          "name": "Petos",
          "description": "Smart pet care management with AI symptom analysis, vet directory, and telehealth booking.",
          "url": "https://petos.app",
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web",
          "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD"
          }
}) }}
        />
      </head>
      <body className={`${plusJakarta.variable} antialiased`}>
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
