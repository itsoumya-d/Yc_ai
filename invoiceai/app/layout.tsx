import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, DM_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InvoiceAI - Get Paid Faster with AI",
    template: "%s | InvoiceAI",
  },
  description:
    "AI-powered invoicing for freelancers and small businesses. Create professional invoices in seconds, automate follow-ups, and get paid faster.",
  keywords: [
    "invoicing",
    "AI invoicing",
    "freelancer invoicing",
    "invoice generator",
    "payment automation",
    "accounts receivable",
  ],
  openGraph: {
    title: "InvoiceAI - Get Paid Faster with AI",
    description:
      "AI-powered invoicing for freelancers and small businesses.",
    type: "website",
    siteName: "InvoiceAI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${dmMono.variable} font-body antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
