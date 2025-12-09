import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mon Panier | Boss Vespa',
  description: 'Gérez vos articles et finalisez votre commande de Vespa.'
}

export default function CartLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

