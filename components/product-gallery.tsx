'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { VideoPlayer, type VideoData } from '@/components/video-player'
import { cn } from '@/lib/utils'

// Media item can be either an image or video
type MediaItem = 
  | { type: 'image'; src: string }
  | { type: 'video'; video: VideoData }

type ProductGalleryProps = {
  images: string[]
  videos?: VideoData[]
  ratio?: number
  className?: string
  thumbnailSize?: 'sm' | 'md'
  productName?: string
}

export function ProductGallery({ 
  images, 
  videos = [], 
  ratio = 4 / 3, 
  className, 
  thumbnailSize = 'md', 
  productName = 'Produit' 
}: ProductGalleryProps) {
  // Combine images and videos into a single media array
  const mediaItems: MediaItem[] = [
    ...images.map((src): MediaItem => ({ type: 'image', src })),
    ...videos.map((video): MediaItem => ({ type: 'video', video })),
  ]

  const [current, setCurrent] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const sizeClasses =
    thumbnailSize === 'sm' ? 'w-14 h-14 md:w-20 md:h-20' : 'w-16 h-16 md:w-24 md:h-24'

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % mediaItems.length))
  }, [mediaItems.length])
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + mediaItems.length) % mediaItems.length))
  }, [mediaItems.length])

  // Get thumbnail URL for video
  const getVideoThumbnail = (video: VideoData) => 
    `https://image.mux.com/${video.playbackId}/thumbnail.webp?time=0&width=320`

  // Render the main media item (image or video)
  const renderMainMedia = (item: MediaItem, index: number, isLightbox: boolean = false) => {
    if (item.type === 'image') {
      return (
        <Image
          src={item.src}
          alt={`${productName} - ${isLightbox ? 'Vue agrandie' : 'Image'} ${index + 1}`}
          fill
          className={isLightbox ? 'object-contain' : 'object-cover absolute inset-0'}
          sizes={isLightbox ? '80vw' : '(min-width: 1024px) 60vw, 100vw'}
          priority={index === 0}
        />
      )
    }

    return (
      <div className="absolute inset-0">
        <VideoPlayer
          video={item.video}
          autoPlay={isLightbox}
          muted={!isLightbox}
          loop={!isLightbox}
          controls={true}
          title={`${productName} - Vidéo ${index + 1}`}
          className="!aspect-auto h-full"
        />
      </div>
    )
  }

  // Render thumbnail item (image or video)
  const renderThumbnail = (item: MediaItem, index: number, isActive: boolean, inLightbox: boolean = false) => {
    if (item.type === 'image') {
      return (
        <Image
          src={item.src}
          alt={`${productName} - Miniature ${inLightbox ? 'galerie ' : ''}${index + 1}`}
          width={160}
          height={160}
          className="h-full w-full object-cover"
        />
      )
    }

    return (
      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getVideoThumbnail(item.video)}
          alt={`${productName} - Aperçu vidéo ${index + 1}`}
          className="h-full w-full object-cover"
        />
        {/* Play icon overlay */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center transition-colors',
          isActive ? 'bg-black/20' : 'bg-black/40 group-hover:bg-black/30'
        )}>
          <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
            <Play className="w-3 h-3 text-black ml-0.5" fill="currentColor" />
          </div>
        </div>
      </div>
    )
  }

  if (mediaItems.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <AspectRatio ratio={ratio}>
            <div className="flex items-center justify-center h-full text-white/50">
              Aucune image disponible
            </div>
          </AspectRatio>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn('space-y-3 md:space-y-4 min-w-0 w-full', className)}>
        {/* Large Main Display */}
        <button
          type="button"
          onClick={() => openLightbox(current)}
          className="block rounded-xl md:rounded-2xl border border-white/10 bg-black/30 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 w-full"
        >
          <div className="relative w-full" style={{ paddingBottom: `${(1 / ratio) * 100}%` }}>
            {renderMainMedia(mediaItems[current], current)}
          </div>
        </button>
        
        {/* Scrollable Thumbnails Row */}
        {mediaItems.length > 1 && (
          <div className="flex gap-1.5 md:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {mediaItems.map((item, idx) => (
              <button
                key={`media-${idx}`}
                type="button"
                onClick={() => setCurrent(idx)}
                className={cn(
                  'rounded-xl border transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 group',
                  sizeClasses,
                  idx === current 
                    ? 'border-amber-400 shadow-lg ring-2 ring-amber-400/50' 
                    : 'border-white/10 hover:border-white/30'
                )}
              >
                {renderThumbnail(item, idx, idx === current)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-999 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox()
          }}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white/80 hover:text-white z-10"
            onClick={closeLightbox}
            aria-label="Fermer la galerie"
          >
            <X size={28} />
          </button>
          
          <div className="flex items-center gap-4 w-full max-w-5xl">
            <button
              type="button"
              className="text-white/70 hover:text-white shrink-0"
              onClick={goPrev}
              aria-label="Média précédent"
            >
              <ChevronLeft size={32} />
            </button>
            
            <div className="flex-1 rounded-2xl overflow-hidden border border-white/20 bg-black">
              <AspectRatio ratio={ratio}>
                {renderMainMedia(mediaItems[lightboxIndex], lightboxIndex, true)}
              </AspectRatio>
            </div>
            
            <button
              type="button"
              className="text-white/70 hover:text-white shrink-0"
              onClick={goNext}
              aria-label="Média suivant"
            >
              <ChevronRight size={32} />
            </button>
          </div>
          
          {/* Lightbox Thumbnails */}
          {mediaItems.length > 1 && (
            <div className="mt-6 flex gap-3 overflow-x-auto max-w-4xl pb-2">
              {mediaItems.map((item, idx) => (
                <button
                  key={`lightbox-media-${idx}`}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={cn(
                    'rounded-lg border overflow-hidden h-16 w-16 shrink-0 group',
                    idx === lightboxIndex ? 'border-amber-400' : 'border-transparent hover:border-white/30'
                  )}
                >
                  {renderThumbnail(item, idx, idx === lightboxIndex, true)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
