'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

type ProductGalleryProps = {
  images: string[]
  ratio?: number
  className?: string
  thumbnailSize?: 'sm' | 'md'
}

export function ProductGallery({ images, ratio = 4 / 3, className, thumbnailSize = 'md' }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sizeClasses =
    thumbnailSize === 'sm' ? 'w-20 h-20' : 'w-24 h-24'

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const goNext = () => setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length))
  const goPrev = () => setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length))

  return (
    <>
      <div className={cn('space-y-4', className)}>
        {/* Large Main Display Image */}
        <button
          type="button"
          onClick={() => openLightbox(current)}
          className="block rounded-2xl border border-white/10 bg-black/30 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full"
        >
          <div className="relative w-full" style={{ paddingBottom: `${(1 / ratio) * 100}%` }}>
            <Image
              src={images[current]}
              alt=""
              fill
              className="object-cover absolute inset-0"
              sizes="(min-width: 1024px) 60vw, 100vw"
              priority
            />
          </div>
        </button>
        
        {/* Scrollable Thumbnails Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={cn(
                'rounded-xl border transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0',
                sizeClasses,
                idx === current ? 'border-amber-400 shadow-lg ring-2 ring-amber-400/50' : 'border-white/10 hover:border-white/30'
              )}
            >
              <Image src={img} alt="" width={160} height={160} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-999 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <button
            type="button"
            className="absolute top-6 right-6 text-white/80 hover:text-white"
            onClick={closeLightbox}
            aria-label="Fermer la galerie"
          >
            <X size={28} />
          </button>
          <div className="flex items-center gap-4 w-full max-w-5xl">
            <button
              type="button"
              className="text-white/70 hover:text-white"
              onClick={goPrev}
              aria-label="Image précédente"
            >
              <ChevronLeft size={32} />
            </button>
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/20 bg-black">
              <AspectRatio ratio={ratio}>
                <Image src={images[lightboxIndex]} alt="" fill className="object-contain" sizes="80vw" />
              </AspectRatio>
            </div>
            <button
              type="button"
              className="text-white/70 hover:text-white"
              onClick={goNext}
              aria-label="Image suivante"
            >
              <ChevronRight size={32} />
            </button>
          </div>
          <div className="mt-6 flex gap-3 overflow-x-auto max-w-4xl">
            {images.map((img, idx) => (
              <button
                key={img + idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={cn(
                  'rounded-lg border',
                  idx === lightboxIndex ? 'border-amber-400' : 'border-transparent'
                )}
              >
                <Image src={img} alt="" width={80} height={80} className="h-16 w-16 object-cover rounded-lg" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

