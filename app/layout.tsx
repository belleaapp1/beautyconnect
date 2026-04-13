import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  metadataBase: new URL('https://beautyconnect.fr'),
  title: {
    default: 'BeautyConnect — La marketplace beauté à domicile',
    template: '%s | BeautyConnect',
  },
  description: 'Trouvez les meilleures presta beauté près de chez vous : nail art, coiffure, cils, maquillage, sourcils. Réservez en ligne, payez en toute sécurité.',
  keywords: ['beauté', 'nail art', 'coiffure', 'cils', 'maquillage', 'sourcils', 'prestataire', 'domicile', 'réservation'],
  authors: [{ name: 'BeautyConnect' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://beautyconnect.fr',
    siteName: 'BeautyConnect',
    title: 'BeautyConnect — La marketplace beauté à domicile',
    description: 'Trouvez et réservez les meilleures prestataires beauté près de chez vous.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'BeautyConnect' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeautyConnect — La marketplace beauté à domicile',
    description: 'Trouvez et réservez les meilleures prestataires beauté près de chez vous.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{ duration: 4000 }}
        />
      </body>
    </html>
  )
}
