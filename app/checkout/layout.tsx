import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commander | Boss Vespa',
  description: 'Finalisez votre commande et recevez votre Vespa de rêve.'
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

