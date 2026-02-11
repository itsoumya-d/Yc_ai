import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Lora } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'StoryThread - Collaborative Fiction Writing',
    template: '%s | StoryThread',
  },
  description: 'AI-powered collaborative fiction writing platform. Build characters, worlds, and stories with intelligent writing assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${lora.variable} antialiased`}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
