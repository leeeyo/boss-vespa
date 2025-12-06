'use client'

import React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sparkles, RotateCcw } from 'lucide-react'

type ColorPickerPanelProps = {
  currentColor: string
  onColorChange: (color: string) => void
}

// Predefined colors - Sophisticated palette
const PRESET_COLORS = [
  { name: 'Noir Metallico', hex: '#1a1a1a' },
  { name: 'Bleu Nuit', hex: '#0f172a' },
  { name: 'Gris Titanio', hex: '#64748b' },
  { name: 'Vert Olive', hex: '#3d4a3d' },
  
  { name: 'Vert Jungle', hex: '#3d7c4a' },
  { name: 'Bleu Marine', hex: '#1e40af' },
  { name: 'Bordeaux', hex: '#7f1d1d' },
  { name: 'Violet Foncé', hex: '#581c87' },
  
  { name: 'Rouge Passione', hex: '#c41e3a' },
  { name: 'Bleu Vivace', hex: '#1e90ff' },
  { name: 'Orange Dragon', hex: '#ff6b35' },
  { name: 'Or Métallique', hex: '#b8860b' },
  
  { name: 'Blanc Perlé', hex: '#f5f5f0' },
  { name: 'Crème', hex: '#fef3c7' },
  { name: 'Rose Poudré', hex: '#fda4af' },
  { name: 'Jaune Sole', hex: '#ffd700' },
]

const DEFAULT_COLOR = '#3d7c4a' // Vert Jungle

export function ColorPickerPanel({ currentColor, onColorChange }: ColorPickerPanelProps) {
  const [customInput, setCustomInput] = useState('')

  const handlePresetClick = (hex: string) => {
    onColorChange(hex)
  }

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value)
    // Auto-apply if valid hex color
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      onColorChange(value)
    }
  }

  const handleReset = () => {
    onColorChange(DEFAULT_COLOR)
    setCustomInput('')
  }

  const currentColorName = PRESET_COLORS.find(
    (c: { hex: string; name: string }) => c.hex.toLowerCase() === currentColor.toLowerCase()
  )?.name

  return (
    <div className="h-full flex flex-col justify-center space-y-4 px-4 py-3">
      {/* Header - Compact */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-orange-500 mb-2 shadow-lg">
          <Sparkles className="w-6 h-6 text-black" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Personnalisation</h2>
        <p className="text-white/60 text-xs max-w-xs mx-auto">
          Cliquez pour changer instantanément
        </p>
      </div>

      {/* Current Color Display - Compact */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-lg border-2 border-white/20 shadow-xl ring-2 ring-amber-400/30"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">
              {currentColorName || 'Personnalisé'}
            </p>
            <p className="text-white/60 font-mono text-xs">{currentColor.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Preset Colors - Compact 4x4 Grid */}
      <div className="space-y-2">
        <Label className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-linear-to-b from-amber-400 to-orange-500 rounded-full" />
          Couleurs
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => handlePresetClick(color.hex)}
              className={`group relative aspect-square rounded-lg overflow-hidden transition-all ${
                currentColor.toLowerCase() === color.hex.toLowerCase()
                  ? 'ring-3 ring-amber-400 scale-105 shadow-xl'
                  : 'ring-1 ring-white/20 hover:ring-amber-400/50 hover:scale-105 shadow-md'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {currentColor.toLowerCase() === color.hex.toLowerCase() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Input - Compact */}
      <div className="space-y-2">
        <Label className="text-white/80 text-xs font-semibold flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-linear-to-b from-amber-400 to-orange-500 rounded-full" />
          Personnalisée
        </Label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCustomInputChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
            maxLength={7}
          />
          <input
            type="color"
            value={currentColor}
            onChange={(e: React.ChangeEvent<HTMLInputElement> ) => onColorChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
            title="Sélecteur"
          />
        </div>
      </div>

      {/* Reset Button - Compact */}
      <Button
        onClick={handleReset}
        variant="outline"
        size="sm"
        className="w-full border border-white/30 text-black hover:bg-amber-400 hover:border-amber-400 transition-all rounded-lg text-xs font-semibold"
      >
        <RotateCcw className="w-3 h-3 mr-1.5 text-black" />
        Réinitialiser
      </Button>
    </div>
  )
}

