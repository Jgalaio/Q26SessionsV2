import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quarentões 26 Sessions',
  description: 'Sistema de votação DJ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  )
}