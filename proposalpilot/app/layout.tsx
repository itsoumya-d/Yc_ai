import type { Metadata } from 'next';
import { Inter, DM_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const dmMono = DM_Mono({ variable: '--font-dm-mono', subsets: ['latin'], display: 'swap', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: { default: 'ProposalPilot - AI-Powered Proposal Generation', template: '%s | ProposalPilot' },
  description: 'Win more deals with AI-powered proposal generation. Create professional proposals in minutes, track engagement, and close faster.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmMono.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
