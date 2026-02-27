import type { Metadata } from 'next';
import { Source_Serif_4, Inter } from 'next/font/google';
import './globals.css';

const sourceSerif = Source_Serif_4({
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
  title: 'Mortal - Plan With Peace of Mind',
  description:
    'AI-powered end-of-life planning and digital legacy platform. Document your wishes, secure your digital assets, and protect the people you love.',
  openGraph: {
    title: 'Mortal - Plan With Peace of Mind',
    description: 'Document your wishes, secure your digital assets, and protect the people you love.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
