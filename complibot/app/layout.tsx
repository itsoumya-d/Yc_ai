import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CompliBot — Compliance Automation',
  description: 'Achieve SOC 2, GDPR, HIPAA compliance in weeks, not months.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
