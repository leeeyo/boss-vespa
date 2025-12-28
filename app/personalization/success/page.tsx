'use client'

import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle, Home, Phone } from 'lucide-react'

export default function ReservationSuccessPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 flex flex-col">
      <NavigationClientWrapper />
      
      <main className="flex-1 flex items-center justify-center pt-30 pb-16">
        <div className="container mx-auto px-4 max-w-lg text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-4">
            Demande Envoyée !
          </h1>

          {/* Message */}
          <p className="text-white/60 text-lg mb-8">
            Merci pour votre demande de personnalisation. Notre équipe va étudier votre configuration et vous contactera dans les <span className="text-amber-400 font-bold">24 heures</span>.
          </p>

          {/* What's Next */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-white font-bold mb-4">Prochaines étapes :</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 text-sm font-bold">1</span>
                <span>Nous vérifions la disponibilité et le prix exact de votre configuration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 text-sm font-bold">2</span>
                <span>Vous recevez un devis détaillé par email</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 text-sm font-bold">3</span>
                <span>Confirmation et planification de la livraison</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Retour à l&apos;accueil
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 text-black hover:bg-white/5">
              <Link href="/contact">
                <Phone className="w-4 h-4 mr-2" />
                Nous contacter
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

