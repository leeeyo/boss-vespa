import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Personnalisation',
  description: 'Personnalisez votre Vespa avec notre outil interactif. Choisissez votre couleur et visualisez votre scooter personnalisé en 3D.',
  path: '/personalization',
  image: '/images/hero.jpg',
})

export default function PersonalizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

