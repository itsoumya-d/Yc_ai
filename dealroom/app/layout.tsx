import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, DM_Mono } from 'next/font/google';
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

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DealRoom - AI That Closes Deals',
  description:
    'AI-powered sales intelligence platform that helps B2B sales teams close more deals faster with deal scoring, email intelligence, and coaching insights.',
  openGraph: {
    title: 'DealRoom - AI That Closes Deals',
    description: 'AI-powered sales intelligence for B2B sales teams.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
