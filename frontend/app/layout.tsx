import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stillwater Pulse',
  description: 'View Instagram posts from Stillwater accounts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

