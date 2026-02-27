import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CompliBot — AI Compliance Automation',
  description: 'Automate SOC 2, GDPR, HIPAA, and ISO 27001 compliance. AI-powered gap analysis, policy generation, and continuous monitoring.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
