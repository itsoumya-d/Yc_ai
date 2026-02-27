import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ variable: '--font-jetbrains-mono', subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'CompliBot - AI Compliance Automation Platform', template: '%s | CompliBot' },
  description: 'AI-powered compliance automation platform for SOC 2, GDPR, HIPAA, and ISO 27001.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
