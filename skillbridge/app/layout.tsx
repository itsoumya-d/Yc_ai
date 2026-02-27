import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SkillBridge - Your Skills Are Worth More Than You Think",
    template: "%s | SkillBridge",
  },
  description:
    "AI-powered career transition platform. Discover your transferable skills, explore growing careers, and get a personalized learning plan to bridge the gap.",
  keywords: [
    "career transition",
    "transferable skills",
    "career change",
    "skills assessment",
    "career exploration",
    "AI career advisor",
    "upskilling",
    "reskilling",
  ],
  openGraph: {
    title: "SkillBridge - Your Skills Are Worth More Than You Think",
    description:
      "AI-powered career transition platform for workers affected by automation.",
    type: "website",
    siteName: "SkillBridge",
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
        className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
