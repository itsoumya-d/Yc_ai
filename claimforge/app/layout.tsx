import type { Metadata } from 'next';
import { Source_Serif_4, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ClaimForge - False Claims Act Intelligence',
  description: 'AI-powered fraud detection and False Claims Act investigation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg-root text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
