import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Computer Management System',
  description: 'Manage computers, users, assignments, and maintenance',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
