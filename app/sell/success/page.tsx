'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  Home,
  Sparkles,
} from 'lucide-react'

export default function SellSuccessPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to defer state update and avoid synchronous setState warning
    const frameId = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frameId)
  }, [])

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900">
      <NavigationClientWrapper />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 pt-5">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Animation */}
            <div
              className={`mb-8 transition-all duration-700 ${
                mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            >
              <div className="relative inline-flex">
                <div className="w-24 h-24 rounded-full bg-emerald-400/10 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1
              className={`text-3xl md:text-4xl font-black text-white mb-4 transition-all duration-700 delay-100 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Annonce soumise avec succès !
            </h1>

            <p
              className={`text-white/60 text-lg mb-8 transition-all duration-700 delay-200 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              Merci pour votre confiance. Notre équipe va examiner votre annonce et vous contacter rapidement.
            </p>

            {/* Steps Card */}
            <Card
              className={`bg-white/5 border-white/10 p-6 md:p-8 text-left mb-8 transition-all duration-700 delay-300 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h2 className="text-lg font-bold text-white mb-6">Prochaines étapes</h2>
              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Examen de votre annonce</h3>
                    <p className="text-white/50 text-sm">
                      Notre équipe examine les détails et photos de votre scooter sous 48h.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Nous vous contactons</h3>
                    <p className="text-white/50 text-sm">
                      Un membre de notre équipe vous appellera pour discuter des détails et convenir d&apos;un rendez-vous si intéressés.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Inspection et offre</h3>
                    <p className="text-white/50 text-sm">
                      Après inspection du véhicule, nous vous faisons une offre ferme. Paiement rapide garanti.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <div
              className={`bg-emerald-400/5 border border-emerald-400/20 rounded-xl p-4 mb-8 transition-all duration-700 delay-400 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-emerald-400 text-sm font-medium mb-2">Des questions ?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/60 text-sm">
                <a href="tel:+21697310394" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  +216 97 310 394
                </a>
                <span className="hidden sm:inline">•</span>
                <a href="mailto:contact@boss-vespa.tn" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  contact@boss-vespa.tn
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-500 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link href="/">
                <Button variant="outline" className="text-black w-full sm:w-auto border-white/20 hover:bg-white/10">
                  <Home className="w-4 h-4 mr-2" />
                  Retour à l&apos;accueil
                </Button>
              </Link>
              <Link href="/collection">
                <Button className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold">
                  Voir nos scooters
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

