import type { Metadata } from 'next';
import { Nunito, Inter } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'NeighborDAO — Your Neighborhood, Organized',
    template: '%s | NeighborDAO',
  },
  description:
    'AI-powered neighborhood coordination platform. Group purchasing, shared resources, democratic voting, treasury management, and community events.',
  keywords: [
    'neighborhood',
    'community',
    'group purchasing',
    'shared resources',
    'voting',
    'HOA',
    'neighborhood coordination',
    'community management',
  ],
  openGraph: {
    title: 'NeighborDAO — Your Neighborhood, Organized',
    description:
      'Save money with group purchasing, share tools and equipment, vote on community decisions, and coordinate events with your neighbors.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream antialiased">{children}</body>
    </html>
  );
}
