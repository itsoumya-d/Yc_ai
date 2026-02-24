import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DealRoom — AI Sales Intelligence',
  description: 'AI-powered sales intelligence platform. Score deals, detect risk, and close more with AI recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
