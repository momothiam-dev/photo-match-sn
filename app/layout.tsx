import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Photo-Match SN',
  description: 'Plateforme de partage de photos pour événements au Sénégal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
