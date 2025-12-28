import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import React from 'react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

import { StructuredData } from '@/components/structured-data'
import { Providers } from '@/components/providers'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boss-vespa.tn'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Boss Vespa Mahdia | Vente, Personnalisation & Livraison de Vespas en Tunisie',
    template: '%s | Boss Vespa Mahdia',
  },
  description: 'Boss Vespa à Mahdia - Votre destination pour acheter, personnaliser et recevoir votre Vespa avec livraison COD en Tunisie. Large sélection de couleurs et modèles.',
  keywords: ['vespa', 'mahdia', 'tunisie', 'scooter', 'personnalisation', 'livraison', 'boss vespa', 'vespa tunisie', 'scooter mahdia'],
  authors: [{ name: 'Boss Vespa' }],
  creator: 'Boss Vespa',
  publisher: 'Boss Vespa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: siteUrl,
    siteName: 'Boss Vespa Mahdia',
    title: 'Boss Vespa Mahdia | Vente, Personnalisation & Livraison de Vespas en Tunisie',
    description: 'Boss Vespa à Mahdia - Votre destination pour acheter, personnaliser et recevoir votre Vespa avec livraison COD en Tunisie.',
    images: [
      {
        url: `${siteUrl}/images/hero.jpg`,
        width: 1200,
        height: 630,
        alt: 'Boss Vespa Mahdia',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boss Vespa Mahdia | Vente, Personnalisation & Livraison de Vespas en Tunisie',
    description: 'Boss Vespa à Mahdia - Votre destination pour acheter, personnaliser et recevoir votre Vespa avec livraison COD en Tunisie.',
    images: [`${siteUrl}/images/hero.jpg`],
  },
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '48x48',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Boss Vespa Mahdia',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+216-97-310-394',
      contactType: 'customer service',
      areaServed: 'TN',
      availableLanguage: ['fr', 'ar'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mahdia',
      addressCountry: 'TN',
      streetAddress: 'Avenue principale',
    },
    sameAs: [],
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Boss Vespa Mahdia',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/collection?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <StructuredData data={organizationSchema} />
        <StructuredData data={websiteSchema} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
