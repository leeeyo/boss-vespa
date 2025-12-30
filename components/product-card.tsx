'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Play } from 'lucide-react'
import { VespaProduct, VideoData } from '@/data/vespa'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { useToast } from '@/hooks/use-toast'

type ProductCardProps = {
  product: VespaProduct
}

// Helper to determine the featured media
function getFeaturedMedia(product: VespaProduct): { type: 'image'; src: string } | { type: 'video'; video: VideoData } | null {
  const { images, videos, featuredMediaIndex } = product
  const totalMedia = images.length + videos.length
  
  if (totalMedia === 0) return null
  
  // Default to first image if no featuredMediaIndex or invalid index
  const index = featuredMediaIndex !== undefined && featuredMediaIndex >= 0 && featuredMediaIndex < totalMedia 
    ? featuredMediaIndex 
    : 0
  
  // Images come first, then videos
  if (index < images.length) {
    return { type: 'image', src: images[index] }
  } else {
    const videoIndex = index - images.length
    return { type: 'video', video: videos[videoIndex] }
  }
}

// Get Mux thumbnail URL for video
function getMuxThumbnail(playbackId: string, width = 640) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=0&width=${width}`
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const [isHovering, setIsHovering] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const isWishlisted = isInWishlist(product.slug)
  const featuredMedia = getFeaturedMedia(product)

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true)
    // Play video on hover if featured media is video
    if (featuredMedia?.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors (browser policy)
      })
    }
  }, [featuredMedia])

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false)
    // Pause and reset video when not hovering
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [])

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, product.productId)
    toast({
      title: 'Ajouté au panier',
      description: `${product.name} a été ajouté à votre panier.`,
    })
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <article 
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)] hover:scale-[1.02] hover:border-amber-400/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Media Container */}
      <div className="relative h-56 md:h-64 overflow-hidden bg-linear-to-br from-slate-900 to-slate-800">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0" aria-label={`Voir ${product.name}`}>
          {featuredMedia?.type === 'video' ? (
            <>
              {/* Video thumbnail (shown when not hovering) - using regular img for better error handling */}
              <div className={`absolute inset-0 transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                {!thumbnailError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getMuxThumbnail(featuredMedia.video.playbackId)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={() => setThumbnailError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Play className="w-12 h-12 text-white/40" />
                  </div>
                )}
              </div>
              {/* Video element (shown on hover) */}
              <video
                ref={videoRef}
                src={`https://stream.mux.com/${featuredMedia.video.playbackId}/medium.mp4`}
                muted
                loop
                playsInline
                preload="none"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
                poster={getMuxThumbnail(featuredMedia.video.playbackId)}
              />
              {/* Play indicator */}
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/20">
                  <Play size={24} className="text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </>
          ) : featuredMedia?.type === 'image' ? (
            <Image
              src={featuredMedia.src}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 320px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            // Fallback placeholder
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <span className="text-white/30 text-sm">No media</span>
            </div>
          )}
        </Link>
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur border border-white/10 text-white transition-all hover:scale-110 active:scale-95"
          aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart 
            size={20} 
            className={isWishlisted ? "fill-rose-500 text-rose-500" : "text-white"} 
          />
        </button>

        {/* Quick Add Button (Bottom Right Overlay) */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 z-10 p-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 text-black shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 hover:shadow-amber-400/50"
          aria-label="Ajouter au panier"
        >
          <ShoppingBag size={20} />
        </button>
        
        {/* Floating Price Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur border border-white/10 text-white px-3 py-1.5 rounded-full font-bold text-sm">
          {product.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-1">
            {product.subtitle}
          </p>
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
          </Link>
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
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all"
          >
            <Link href={`/product/${product.slug}`} aria-label={`Voir les détails de ${product.name}`}>
              Voir les détails
            </Link>
          </Button>
        </div>
      </div>
    </article>
  )
}
