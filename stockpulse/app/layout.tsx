import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StockPulse - AI Inventory Scanner',
  description:
    'AI-powered inventory scanning and management for small retail stores and restaurants. Track stock, scan products, and never run out.',
  openGraph: {
    title: 'StockPulse - AI Inventory Scanner',
    description: 'AI-powered inventory management for small business.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
