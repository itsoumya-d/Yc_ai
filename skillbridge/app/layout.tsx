import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge — AI Career Transition",
  description: "SkillBridge uses AI to identify your transferable skills, map them to growing careers, and create personalized upskilling plans to help you transition successfully.",
  keywords: ["career transition", "AI", "skills", "upskilling", "resume", "career paths"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
