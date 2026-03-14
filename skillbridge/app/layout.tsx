import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillBridge — Career Transition Platform',
  description:
    'SkillBridge helps displaced workers identify transferable skills, match to new careers, and get personalized learning plans.',
  keywords: ['career transition', 'skills assessment', 'job matching', 'learning plans'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
