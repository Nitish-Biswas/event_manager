import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Event Manager - Discover & RSVP to Amazing Events',
  description: 'Find and RSVP to exciting events in your city. Built with Next.js and Supabase.',
  keywords: ['events', 'RSVP', 'meetups', 'conferences', 'social'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}