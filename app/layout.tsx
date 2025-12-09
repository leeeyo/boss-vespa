import type { Metadata } from 'next'
import './globals.css'
import React from 'react'
// Initialize fonts

import { Toaster } from '@/components/ui/toaster'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'

export const metadata: Metadata = {
  title: 'Boss Vespa Mahdia | Vente, Personnalisation & Livraison de Vespas en Tunisie',
  description: 'Boss Vespa à Mahdia - Votre destination pour acheter, personnaliser et recevoir votre Vespa avec livraison COD en Tunisie. Large sélection de couleurs et modèles.',
  generator: 'v0.app',
  keywords: ['vespa', 'mahdia', 'tunisie', 'scooter', 'personnalisation', 'livraison', 'boss vespa'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          <WishlistProvider>
            {children}
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
