import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DealRoom – AI Sales Intelligence', description: 'AI that closes deals. Pipeline intelligence, deal scoring, and next-best-action recommendations for B2B sales teams.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
