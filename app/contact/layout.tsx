import { Metadata } from 'next'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Contact',
  description: 'Contactez Boss Vespa Mahdia pour vos questions, devis personnalisés ou rendez-vous au showroom. Disponible 7j/7.',
  path: '/contact',
  image: '/images/hero.jpg',
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
