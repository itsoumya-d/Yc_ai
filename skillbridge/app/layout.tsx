import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'SkillBridge', template: '%s · SkillBridge' },
  description: 'Bridge your skills to a new career. AI-powered career transition guidance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-page text-primary antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-[#0D9488] focus:px-3 focus:py-2 focus:text-white">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
