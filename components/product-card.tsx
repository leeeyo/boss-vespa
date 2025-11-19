import Image from 'next/image'
import Link from 'next/link'
import { VespaProduct } from '@/data/vespa'
import { Button } from '@/components/ui/button'

type ProductCardProps = {
  product: VespaProduct
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:scale-[1.02] hover:border-amber-400/30">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <Image
          src={product.images[0] as string}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Floating Price Badge */}
        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg">
          {product.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-1">
            {product.subtitle}
          </p>
          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>
        </div>

        <p className="text-amber-300/90 text-sm font-medium">
          {product.color}
        </p>

        <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
          {product.specs.slice(0, 2).map((spec) => (
            <div key={spec.label} className="space-y-0.5">
              <p className="text-white/40 uppercase tracking-wider">{spec.label}</p>
              <p className="text-white/80 font-semibold">{spec.value}</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold hover:from-amber-300 hover:to-orange-400 transition-all shadow-lg"
          >
            <Link href={`/product/${product.slug}`}>
              Voir les détails
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}

