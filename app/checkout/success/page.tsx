'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NavigationClientWrapper } from '@/components/navigation-client-wrapper'
import { Footer } from '@/components/footer'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  // Get orderId from URL params, fallback to a placeholder if not provided
  const orderId = searchParams.get('orderId') || 'En cours de traitement'

  return (
    <main className="flex-1 flex items-center justify-center p-4 py-24">
      <Card className="max-w-md w-full border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-500">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
            <CheckCircle className="w-20 h-20 text-green-400 relative z-10 animate-in zoom-in duration-500 delay-150" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
              Merci pour votre commande !
            </h1>
            <p className="text-white/60">
              Votre commande a été enregistrée avec succès.
            </p>
          </div>

          <div className="w-full bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-sm text-white/60 mb-1 uppercase tracking-wider">Numéro de commande</p>
            <p className="text-xl font-mono font-bold text-amber-300">
              #{orderId}
            </p>
          </div>

          <div className="text-sm text-white/80 leading-relaxed">
            <p>
              Notre équipe vous contactera sous <span className="text-white font-semibold">24h</span> pour confirmer les détails de livraison et le paiement.
            </p>
          </div>

          <Button 
            asChild
            className="w-full bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400 py-6 text-lg mt-4"
          >
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white flex flex-col">
      <NavigationClientWrapper />
      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center p-4 py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </main>
      }>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  )
}

