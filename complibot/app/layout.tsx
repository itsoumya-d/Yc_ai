import type { Metadata } from 'next';
import { Inter, DM_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CompliBot - Your AI Compliance Officer',
    template: '%s | CompliBot',
  },
  description:
    'CompliBot automates SOC 2, GDPR, HIPAA, and ISO 27001 compliance for startups. AI-powered gap analysis, policy generation, and evidence collection.',
  keywords: [
    'compliance automation',
    'SOC 2',
    'GDPR',
    'HIPAA',
    'ISO 27001',
    'GRC',
    'audit',
    'security compliance',
  ],
  openGraph: {
    title: 'CompliBot - Your AI Compliance Officer',
    description:
      'Compress a 6-month compliance journey into 6 weeks. AI-powered gap analysis, policy generation, and evidence collection.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-surface-secondary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
