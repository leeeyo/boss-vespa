'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import { VespaModel } from './vespa-model'
import * as THREE from 'three'
import { Button } from './ui/button'
import { RotateCcw, Maximize2 } from 'lucide-react'

type CustomizerSceneProps = {
  color: string
}

export function CustomizerScene({ color }: CustomizerSceneProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showInstructions, setShowInstructions] = useState(true)
  const [contextLost, setContextLost] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const controlsRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Hide instructions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  const handleRetry = () => {
    setContextLost(false)
    setRetryCount(prev => prev + 1)
    setIsLoading(true)
  }

  return (
    <div className="w-full h-full relative">
      {contextLost ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 backdrop-blur-sm">
          <div className="text-center max-w-md mx-4">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-white font-bold text-xl mb-2">Contexte 3D perdu</h3>
            <p className="text-white/60 text-sm mb-4">
              La mémoire GPU est saturée. Fermez quelques onglets et réessayez.
            </p>
            <Button
              onClick={handleRetry}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold"
            >
              Réessayer
            </Button>
          </div>
        </div>
      ) : (
        <Canvas
          key={`canvas-${retryCount}`} // Force remount on retry
          shadows="soft"
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false
          }}
          dpr={[1, 1.5]}
          className="bg-transparent"
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement
            
            // Handle WebGL context loss/restore
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              event.preventDefault()
              console.log('WebGL context lost, attempting to restore...')
              setContextLost(true)
              setIsLoading(true)
            })
            
            gl.domElement.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored')
              setContextLost(false)
              setIsLoading(false)
            })
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
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0001}
        />
        <pointLight position={[-10, -5, -5]} intensity={0.4} color="#fff" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.6}
        />

        {/* Environment with lower resolution */}
        <Environment preset="city" resolution={256} />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <VespaModel color={color} onLoad={() => setIsLoading(false)} />
        </Suspense>

        {/* Optimized Ground Shadow */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.35}
          scale={10}
          blur={1.5}
          far={4}
          resolution={256}
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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-gray-900/80 backdrop-blur-sm z-10 transition-opacity duration-500">
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
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500/90 to-orange-500/90 backdrop-blur-sm text-black px-6 py-3 rounded-full text-sm font-semibold pointer-events-none shadow-lg transition-all duration-1000 ${
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

