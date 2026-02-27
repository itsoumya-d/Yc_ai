import type { Metadata } from 'next';
import { Nunito, Inter } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
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
  title: 'GovPass - Benefits Made Simple',
  description:
    'AI-powered government benefits navigator that helps you find, apply for, and track public assistance programs you qualify for.',
  openGraph: {
    title: 'GovPass - Benefits Made Simple',
    description: 'Find and apply for government benefits you qualify for.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
