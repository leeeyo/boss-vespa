'use client'

import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import { VespaModel } from './vespa-model'
import { Button } from './ui/button'
import { RotateCcw, Maximize2 } from 'lucide-react'
import { useState, useRef, useEffect, useCallback, Suspense, ComponentRef } from 'react'

// Error Boundary for catching Environment loading errors
class EnvironmentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Silently handle environment loading errors (network failures, etc.)
    if (
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('.hdr') ||
      error.message?.includes('NetworkError') ||
      errorInfo.componentStack?.includes('Environment')
    ) {
      // Error is handled, don't rethrow
      return
    }
    // Re-throw other unexpected errors
    throw error
  }

  render() {
    if (this.state.hasError) {
      // Return null - the scene will work fine without environment map
      return null
    }
    return this.props.children
  }
}

// Safe Environment component that handles offline/network errors
function SafeEnvironment({ 
  preset, 
  resolution 
}: { 
  preset: 'apartment' | 'city' | 'dawn' | 'forest' | 'lobby' | 'night' | 'park' | 'studio' | 'sunset' | 'warehouse'
  resolution: number 
}) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check online status
    const checkOnline = () => {
      setIsOnline(navigator.onLine)
    }
    
    checkOnline()
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Also listen for unhandled promise rejections (fetch errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('Failed to fetch') ||
        event.reason?.message?.includes('.hdr')
      ) {
        event.preventDefault()
        setIsOnline(false)
      }
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // If offline, don't render Environment
  // The existing lights will provide sufficient lighting
  if (!isOnline) {
    return null
  }

  // Wrap in Error Boundary and Suspense to catch any loading errors
  return (
    <EnvironmentErrorBoundary>
      <Suspense fallback={null}>
        <Environment preset={preset} resolution={resolution} />
      </Suspense>
    </EnvironmentErrorBoundary>
  )
}

type CustomizerSceneProps = {
  color: string
}

export function CustomizerScene({ color }: CustomizerSceneProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [contextLost, setContextLost] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const hasLoadedOnce = useRef(false)
  const isInitialMount = useRef(true)
  const contextLossCount = useRef(0)

  // Delay canvas initialization to let page stabilize
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanvasReady(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Hide instructions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // Ensure loading state is properly managed with useCallback to prevent recreating on every render
  const handleModelLoad = useCallback(() => {
    hasLoadedOnce.current = true
    setIsLoading(false)
  }, [])

  // Fallback: Hide loading overlay after 3 seconds if onLoad doesn't fire
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (isLoading && !hasLoadedOnce.current) {
        setIsLoading(false)
      }
    }, 3000)
    return () => clearTimeout(fallbackTimer)
  }, [isLoading])

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  const handleRetry = () => {
    contextLossCount.current = 0
    isInitialMount.current = true
    setContextLost(false)
    setCanvasReady(false)
    setIsLoading(true)
    // Re-initialize canvas after a short delay
    setTimeout(() => {
      setCanvasReady(true)
      setRetryCount(prev => prev + 1)
    }, 100)
  }

  return (
    <div className="w-full h-full relative">
      {contextLost ? (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 backdrop-blur-sm">
          <div className="text-center max-w-md mx-4">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Contexte 3D perdu</h3>
            <p className="text-white/60 text-sm mb-4">
              La mémoire GPU est saturée. Fermez quelques onglets et réessayez.
            </p>
            <Button
              onClick={handleRetry}
              className="bg-linear-to-r from-amber-400 to-orange-500 text-black font-bold"
            >
              Réessayer
            </Button>
          </div>
        </div>
      ) : !canvasReady ? (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 backdrop-blur-sm">
          <div className="text-white/80 text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="font-semibold">Initialisation...</p>
            </div>
          </div>
        </div>
      ) : (
        <Canvas
          key={`canvas-${retryCount}`} // Force remount on retry
          shadows="basic"
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
            stencil: false,
            depth: true
          }}
          dpr={[1, 1.25]}
          className="bg-transparent"
          frameloop="always"
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement
            
            // Handle WebGL context loss/restore
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              contextLossCount.current++
              
              // During initial mount, force canvas remount to get a fresh context
              if (isInitialMount.current && contextLossCount.current <= 2) {
                setRetryCount(prev => prev + 1) // Force remount with new key
                return
              }
              
              // After initialization period or too many losses, show error
              setContextLost(true)
              setIsLoading(true)
            })
            
            gl.domElement.addEventListener('webglcontextrestored', () => {
              contextLossCount.current = 0
              setContextLost(false)
              // Don't change isLoading here - let the model's onLoad handle it
            })
            
            // Mark as no longer initial mount after 5 seconds (generous for HMR)
            setTimeout(() => {
              isInitialMount.current = false
            }, 5000)
          }}
        >
      
        <PerspectiveCamera makeDefault position={[3, 2, 5]} fov={50} />
        
        {/* Optimized Lighting */}
        <ambientLight intensity={0.6} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1.2}
          castShadow
          shadow-mapSize={[256, 256]}
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, -5, -5]} intensity={0.4} color="#fff" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.6}
        />

        {/* Environment with lower resolution - gracefully handles offline/network errors */}
        <SafeEnvironment preset="city" resolution={128} />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <VespaModel color={color} onLoad={handleModelLoad} />
        </Suspense>

        {/* Optimized Ground Shadow */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.3}
          scale={10}
          blur={1.2}
          far={4}
          resolution={128}
          frames={1}
        />

        {/* Controls with damping */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          autoRotate={false}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.5}
          makeDefault
        />
        </Canvas>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-linear-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 backdrop-blur-sm z-10 transition-opacity duration-500">
          <div className="text-white/80 text-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="font-semibold">Chargement de votre Vespa...</p>
              <p className="text-xs text-white/50">Préparez-vous à personnaliser</p>
            </div>
          </div>
        </div>
      )}

      {/* Camera Controls */}
      {!isLoading && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          <Button
            onClick={resetCamera}
            size="icon"
            className="bg-black/60 hover:bg-black/80 backdrop-blur-sm border border-white/20 text-white shadow-lg"
            title="Réinitialiser la vue"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Instructions Overlay - Fades out after 5 seconds */}
      {!isLoading && (
        <div 
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-linear-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm text-black px-6 py-3 rounded-full text-sm font-semibold pointer-events-none shadow-lg transition-all duration-1000 ${
            showInstructions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-center flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Faites glisser pour tourner • Molette pour zoomer</span>
            <span className="sm:hidden">Glissez pour tourner • Pincez pour zoomer</span>
          </p>
        </div>
      )}

      {/* Color Display */}
      {!isLoading && (
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full border-2 border-white/30 shadow-inner"
              style={{ backgroundColor: color }}
            />
            <div className="text-white text-sm">
              <p className="font-semibold">Couleur</p>
              <p className="text-xs text-white/60 font-mono">{color}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

