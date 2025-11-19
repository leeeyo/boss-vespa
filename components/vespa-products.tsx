import Image from 'next/image'
import Link from 'next/link'

import { getFeaturedVespas } from '@/data/vespa'
import { Button } from '@/components/ui/button'

export function VespaProducts() {
  const featured = getFeaturedVespas(2)

  return (
    <section
      id="featured"
      className="py-20 px-4 bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white border-y border-white/5"
    >
      <div className="container mx-auto">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-300">Nouveautés</p>
          <h2 className="text-4xl md:text-5xl font-black bg-linear-to-r from-amber-400 via-rose-400 to-sky-400 bg-clip-text text-transparent">
            Vespas Signature
          </h2>
          <p className="text-white/80 max-w-2xl">
            Deux pièces maîtresses prêtes à être livrées : finitions premium, personnalisation atelier incluse et livraison
            nationale express.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {featured.map((vespa) => (
            <article
              key={vespa.slug}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
            >
              <div className="flex flex-col lg:flex-row">
                <div className="relative lg:w-2/5 h-64 lg:h-[400px] shrink-0">
                  <Image
                    src={vespa.images[0] as string}
                    alt={vespa.name}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="flex-1 p-6 lg:p-8 flex flex-col space-y-3">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">{vespa.subtitle}</p>
                  <h3 className="text-2xl lg:text-3xl font-bold">{vespa.name}</h3>
                  <p className="text-amber-300 font-semibold text-sm">{vespa.color}</p>
                  <p className="text-white/80 text-sm leading-relaxed">{vespa.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-white/70 pt-2">
                    {vespa.specs.slice(0, 4).map((spec) => (
                      <div key={spec.label}>
                        <p className="text-white/40 uppercase tracking-[0.3em] text-xs">{spec.label}</p>
                        <p className="font-semibold text-white mt-1">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-auto">
                    <span className="text-xl font-semibold text-white">{vespa.price}</span>
                    <Button asChild className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400">
                      <Link href={`/product/${vespa.slug}`}>Voir le modèle</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

