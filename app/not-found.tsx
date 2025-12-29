import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="grow flex items-center justify-center relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 py-24 md:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-40 blur-3xl bg-linear-to-br from-amber-500/40 via-rose-500/30 to-sky-500/30" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center mt-12 md:mt-20">
          <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500 animate-pulse">
              404
            </h1>
            
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Oups ! La route s&apos;arrête ici.
              </h2>
              <p className="text-lg text-white/70 max-w-md mx-auto">
                La page que vous recherchez semble s&apos;être perdue en chemin. 
                Peut-être a-t-elle pris une mauvaise sortie ?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                asChild
                size="lg"
                className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold shadow-[0_18px_35px_rgba(250,204,21,0.3)] hover:from-amber-300 hover:to-orange-400 transition-all hover:-translate-y-1"
              >
                <Link href="/">
                  <Home className="mr-2 h-5 w-5" />
                  Retour à l&apos;accueil
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 text-white font-semibold backdrop-blur hover:bg-white/10 transition-all hover:-translate-y-1"
              >
                <Link href="/collection">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Voir nos Vespas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

