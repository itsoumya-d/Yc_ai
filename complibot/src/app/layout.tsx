import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'CompliBot – AI Compliance Officer',
  description: 'Automate SOC 2, GDPR, HIPAA, and ISO 27001 compliance for your startup. From gap analysis to audit-ready in 6 weeks.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
