import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Boss Vespa',
  description: 'Contactez-nous pour toute question ou demande de devis personnalisé.'
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

