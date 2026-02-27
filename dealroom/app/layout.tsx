import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DealRoom – AI Sales Intelligence",
    template: "%s | DealRoom",
  },
  description:
    "AI-powered sales intelligence platform with deal scoring, pipeline management, and follow-up automation.",
  keywords: ["sales", "CRM", "AI", "pipeline", "deals"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dealroom.app",
    siteName: "DealRoom",
    title: "DealRoom – AI Sales Intelligence",
    description:
      "AI-powered sales intelligence platform with deal scoring, pipeline management, and follow-up automation.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: {
                primary: "#7c3aed",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
