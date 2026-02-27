import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FieldLens - AI Mentor for Tradespeople',
  description:
    'AI-powered coaching companion for plumbers, electricians, and HVAC technicians. Get real-time guidance, safety checks, and skill tracking on every job.',
  openGraph: {
    title: 'FieldLens - AI Mentor for Tradespeople',
    description: 'Real-time AI coaching for skilled trades professionals.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
