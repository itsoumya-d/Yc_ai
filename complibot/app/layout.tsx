import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CompliBot — Compliance Automation Platform',
  description:
    'Achieve SOC 2, GDPR, and HIPAA certifications faster with AI-generated policies, controls checklists, and evidence collection.',
  keywords: ['SOC 2', 'GDPR', 'HIPAA', 'compliance', 'security', 'ISO 27001'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
