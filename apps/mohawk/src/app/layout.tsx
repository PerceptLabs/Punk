import type { Metadata } from 'next'
import { PunkThemeProvider } from '@punk/tokens'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mohawk - Punk Framework Builder',
  description: 'Visual builder for creating Punk Framework applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PunkThemeProvider theme="dark">
          {children}
        </PunkThemeProvider>
      </body>
    </html>
  )
}
