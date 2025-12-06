'use client'

import React from 'react'
import { Button } from './ui/button'
import { Palette } from 'lucide-react'

type SimpleVespaViewerProps = {
  color: string
}

export function SimpleVespaViewer({ color }: SimpleVespaViewerProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900 p-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Color indicator */}
        <div className="mb-8 inline-flex items-center gap-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3">
          <Palette className="w-5 h-5 text-amber-400" />
          <span className="text-white text-sm font-semibold">Couleur sélectionnée</span>
          <div 
            className="w-8 h-8 rounded-full border-2 border-white/30"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Placeholder for 3D model */}
        <div 
          className="relative aspect-[4/3] rounded-2xl border-2 border-white/10 overflow-hidden mb-6"
          style={{
            backgroundColor: color,
            opacity: 0.3
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60 text-center">
              <div className="w-20 h-20 mx-auto mb-4 opacity-30">
                {/* Vespa silhouette - simple SVG */}
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <ellipse cx="30" cy="75" rx="12" ry="12" />
                  <ellipse cx="70" cy="75" rx="12" ry="12" />
                  <path d="M20 75 Q15 65, 20 55 L30 50 L40 45 L50 40 L60 40 L70 45 L75 50 Q80 60, 75 70 Z" />
                  <rect x="35" y="30" width="30" height="15" rx="5" />
                </svg>
              </div>
              <p className="text-sm font-semibold">Aperçu Vespa</p>
              <p className="text-xs mt-2">Mode 2D activé pour économiser les ressources</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-200/80">
          <p className="font-semibold mb-2">📱 Mode simplifié activé</p>
          <p className="text-xs">
            Le rendu 3D utilise trop de ressources. Utilisez le sélecteur de couleur pour prévisualiser votre Vespa, 
            puis visitez notre showroom pour la voir en personne!
          </p>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Réessayer le 3D
          </Button>
          <Button
            onClick={() => window.location.href = '/collection'}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold"
          >
            Voir la collection
          </Button>
        </div>
      </div>
    </div>
  )
}

