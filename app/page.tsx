import { Metadata } from 'next'
import React from 'react'

import { Hero } from '@/components/hero'
import { VespaProducts } from '@/components/vespa-products'
import { VespaShowcase } from '@/components/vespa-showcase'
import { Services } from '@/components/services'
import { Location } from '@/components/location'
import { Footer } from '@/components/footer'
import { Navigation } from '@/components/navigation'
import { generateMetadata as genMeta } from '@/lib/seo'

// Revalidate the homepage every 60 seconds to pick up featured product changes
export const revalidate = 60

export const metadata: Metadata = genMeta({
  title: 'Boss Vespa Mahdia',
  description: 'Vente, personnalisation artistique et livraison de Vespas dans toute la Tunisie. Large sélection de modèles et couleurs disponibles à Mahdia.',
  path: '/',
  image: '/images/hero.jpg',
})

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <Hero /> 
        <VespaProducts />
        <VespaShowcase />
        <Services />
        <Location />
      </main>
      <Footer />
    </div>
  )
}
