'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { CustomizerScene } from '@/components/customizer-scene'
import { ColorPickerPanel } from '@/components/color-picker-panel'
import { WebGLFallback } from '@/components/webgl-fallback'
import { SimpleVespaViewer } from '@/components/simple-vespa-viewer'
import { findMatchingProduct } from '@/utils/color-matching'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink, Share2 } from 'lucide-react'

export default function PersonalizationPage() {
  const searchParams = useSearchParams()
  const colorParam = searchParams.get('color')
  
  const [currentColor, setCurrentColor] = useState(colorParam || '#3d7c4a') // Default to Vert Jungle
  const [webglError, setWebglError] = useState(false)
  const [use2DFallback, setUse2DFallback] = useState(false)

  // Update color from URL params
  useEffect(() => {
    if (colorParam) {
      setCurrentColor(colorParam)
    }
  }, [colorParam])

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebglError(true)
      }
    } catch (e) {
      setWebglError(true)
    }
  }, [])

  // Switch to 2D fallback after 3 failed attempts (context losses)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden, might cause context loss
        console.log('Page hidden, WebGL contexts may be released')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Find matching product based on current color
  const { product: matchingProduct, similarity } = findMatchingProduct(currentColor)

  const handleShare = () => {
    const url = `${window.location.origin}/personalization?color=${encodeURIComponent(currentColor)}`
    if (navigator.share) {
      navigator.share({
        title: 'Ma Vespa personnalisée',
        text: 'Regardez ma Vespa personnalisée!',
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Lien copié dans le presse-papiers!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 flex flex-col">
      <Navigation />

      <main className="flex-1 flex flex-col lg:flex-row pt-16">
        {/* 3D Scene - Left Side */}
        <div className="flex-1 lg:w-[65%] relative">
          <div className="absolute inset-0">
            {use2DFallback ? (
              <SimpleVespaViewer color={currentColor} />
            ) : webglError ? (
              <WebGLFallback />
            ) : (
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900">
                    <div className="text-white/60 text-center">
                      <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="font-semibold mb-2">Chargement de votre Vespa...</p>
                      <p className="text-xs text-white/40 max-w-xs mx-auto">
                        Si le chargement prend trop de temps, 
                        <button 
                          onClick={() => setUse2DFallback(true)}
                          className="text-amber-400 hover:text-amber-300 ml-1 underline"
                        >
                          cliquez ici
                        </button> pour le mode simplifié
                      </p>
                    </div>
                  </div>
                }
              >
                <CustomizerScene color={currentColor} />
              </Suspense>
            )}
          </div>

          {/* Product Match Banner */}
          {matchingProduct && similarity > 70 && (
            <div className="absolute top-4 left-4 right-4 lg:left-auto lg:right-4 lg:max-w-sm">
              <div className="bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs uppercase tracking-wider text-black/60">Modèle correspondant</p>
                      <span className="text-xs font-bold text-black/80 bg-black/10 px-2 py-0.5 rounded-full">
                        {similarity}%
                      </span>
                    </div>
                    <h3 className="font-bold text-black text-lg">{matchingProduct.name}</h3>
                    <p className="text-black/80 text-sm">{matchingProduct.subtitle}</p>
                    <p className="font-bold text-black mt-2">{matchingProduct.price}</p>
                  </div>
                  <Button asChild size="sm" className="bg-black text-white hover:bg-black/80 shrink-0">
                    <Link href={`/product/${matchingProduct.slug}`}>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="absolute bottom-4 right-4">
            <Button
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>
        </div>

        {/* Color Picker Panel - Right Side */}
        <div className="lg:w-[35%] h-[50vh] lg:h-auto border-t lg:border-t-0 lg:border-l border-white/10">
          <div className="h-full bg-gradient-to-br from-slate-900/95 to-gray-900/95 backdrop-blur-xl overflow-auto">
            <ColorPickerPanel currentColor={currentColor} onColorChange={setCurrentColor} />
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <div className="border-t border-white/10 bg-slate-950/50 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-lg mb-1">Vous aimez cette personnalisation?</h3>
              <p className="text-white/60 text-sm">
                Découvrez nos modèles disponibles ou contactez-nous pour une commande personnalisée
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/collection">Voir la collection</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold"
              >
                <Link href="/#contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

