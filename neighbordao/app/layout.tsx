import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeighborDAO - Community Coordination Platform',
  description: 'Connect, vote, and coordinate with your neighborhood community',
}

export default function RootLayout({
  children,
}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}