import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillBridge — AI Career Navigator',
  description: 'Navigate career transitions with AI-powered skill matching, personalized upskilling plans, and curated job opportunities.',
  keywords: ['career transition', 'skill assessment', 'AI career coach', 'upskilling', 'job matching'],
  openGraph: {
    title: 'SkillBridge — AI Career Navigator',
    description: 'Navigate career transitions with AI-powered skill matching and personalized learning plans.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
