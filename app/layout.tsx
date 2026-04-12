import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BeautyConnect — Trouve ta presta beauté idéale',
  description: 'Des centaines de nail artists, coiffeuses et prothésistes ongulaires près de chez toi.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
