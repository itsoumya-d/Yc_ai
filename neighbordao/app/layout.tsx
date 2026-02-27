import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeighborDAO — Community Coordination',
  description: 'Group purchasing, shared resources, democratic voting, and transparent treasury management for your neighborhood.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
