import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ma Liste de Souhaits | Boss Vespa',
  description: 'Vos modèles Vespa favoris sauvegardés pour plus tard.'
}

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

