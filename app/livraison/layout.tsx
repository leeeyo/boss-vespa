import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Livraison',
  description: 'Livraison de Vespas partout en Tunisie. Paiement COD, vérification avant paiement. Tarifs transparents pour Mahdia, Sahel et toute la Tunisie.',
  path: '/livraison',
  image: '/images/showcase3.jpg',
})

export default function LivraisonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

