import type { Metadata } from 'next';
import { Nunito, Inter } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'NeighborDAO', template: '%s · NeighborDAO' },
  description: 'Your neighborhood, organized. AI-powered community coordination.',
  keywords: ['neighborhood', 'community', 'group purchasing', 'HOA', 'local governance'],
  openGraph: {
    title: 'NeighborDAO',
    description: 'AI-powered neighborhood coordination',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body className="bg-page text-primary antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-[var(--color-leaf-600)] focus:px-3 focus:py-2 focus:text-white">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
