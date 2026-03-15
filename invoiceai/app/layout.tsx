import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, DM_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ToastProvider } from "@/components/ui/toast";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InvoiceAI - Get Paid Faster with AI",
    template: "%s | InvoiceAI",
  },
  description:
    "AI-powered invoicing for freelancers and small businesses. Create professional invoices in seconds, automate follow-ups, and get paid faster.",
  keywords: [
    "invoicing",
    "AI invoicing",
    "freelancer invoicing",
    "invoice generator",
    "payment automation",
    "accounts receivable",
  ],
  openGraph: {
    title: "InvoiceAI - Get Paid Faster with AI",
    description: "AI-powered invoicing for freelancers and small businesses.",
    type: "website",
    url: "https://invoiceai.com",
    siteName: "InvoiceAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "InvoiceAI - Get Paid Faster with AI",
    description: "AI-powered invoicing for freelancers and small businesses.",
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
          "name": "InvoiceAI",
          "description": "AI-powered invoicing and payments platform for freelancers and small businesses.",
          "url": "https://invoiceai.app",
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
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${dmMono.variable} font-body antialiased`}
      >
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
