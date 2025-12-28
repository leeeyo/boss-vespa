import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Vendez votre scooter | Boss Vespa',
  description: 'Vendez votre scooter à Boss Vespa. Nous achetons des Vespas, scooters et deux-roues de toutes marques. Estimation gratuite et paiement rapide.',
  path: '/sell',
})

export default function SellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

