import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeighborDAO — Community Governance Platform',
  description: 'Govern your neighborhood together with transparent proposals, voting, and shared treasury management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
