'use client'

import MuxPlayer from '@mux/mux-player-react'
import { cn } from '@/lib/utils'

export type VideoData = {
  muxAssetId: string
  playbackId: string
}

type VideoPlayerProps = {
  video: VideoData
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  poster?: string
  accentColor?: string
  title?: string
}

export function VideoPlayer({
  video,
  className,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = true,
  poster,
  accentColor = '#f59e0b', // amber-500
  title,
}: VideoPlayerProps) {
  return (
    <MuxPlayer
      playbackId={video.playbackId}
      streamType="on-demand"
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      className={cn('w-full h-full', className)}
      style={{
        aspectRatio: '4/3',
        '--controls': controls ? 'visible' : 'none',
        '--media-accent-color': accentColor,
      } as React.CSSProperties & Record<`--${string}`, string>}
      poster={poster}
      title={title}
      thumbnailTime={0}
      preload="metadata"
    />
  )
}

// Thumbnail component for video preview in gallery
type VideoThumbnailProps = {
  video: VideoData
  className?: string
  onClick?: () => void
  isActive?: boolean
}

export function VideoThumbnail({ video, className, onClick, isActive }: VideoThumbnailProps) {
  const thumbnailUrl = `https://image.mux.com/${video.playbackId}/thumbnail.webp?time=0&width=320`

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative rounded-xl border transition-all duration-200 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shrink-0 group',
        isActive
          ? 'border-amber-400 shadow-lg ring-2 ring-amber-400/50'
          : 'border-white/10 hover:border-white/30',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt="Aperçu vidéo"
        className="h-full w-full object-cover"
      />
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-black ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </button>
  )
}

