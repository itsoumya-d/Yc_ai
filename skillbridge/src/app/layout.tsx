import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SkillBridge – AI Career Navigator',
  description: 'Your AI career transition engine. Find your next career path, close the skills gap, and land your next opportunity.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
