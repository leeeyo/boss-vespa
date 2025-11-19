'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sparkles, RotateCcw } from 'lucide-react'

type ColorPickerPanelProps = {
  currentColor: string
  onColorChange: (color: string) => void
}

// Predefined colors matching Vespa products
const PRESET_COLORS = [
  { name: 'Vert Jungle', hex: '#3d7c4a' },
  { name: 'Blanc Perlé', hex: '#f5f5f0' },
  { name: 'Rouge Passione', hex: '#c41e3a' },
  { name: 'Bleu Vivace', hex: '#1e90ff' },
  { name: 'Jaune Sole', hex: '#ffd700' },
  { name: 'Noir Metallico', hex: '#1a1a1a' },
  { name: 'Gris Titanio', hex: '#898989' },
  { name: 'Orange Dragon', hex: '#ff6b35' },
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
    (c) => c.hex.toLowerCase() === currentColor.toLowerCase()
  )?.name

  return (
    <div className="h-full flex flex-col justify-center space-y-8 px-6 py-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-black" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Personnalisation</h2>
        <p className="text-white/60 text-sm max-w-xs mx-auto">
          Cliquez sur une couleur pour voir le résultat instantanément
        </p>
      </div>

      {/* Current Color Display */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-3">
        <Label className="text-white/80 text-xs uppercase tracking-wider font-semibold">
          Couleur Sélectionnée
        </Label>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-2xl ring-4 ring-amber-400/30"
            style={{ backgroundColor: currentColor }}
          />
          <div className="flex-1">
            <p className="text-white font-bold text-xl mb-1">
              {currentColorName || 'Personnalisé'}
            </p>
            <p className="text-white/60 font-mono text-sm">{currentColor.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Preset Colors - Compact Grid */}
      <div className="space-y-4">
        <Label className="text-white/80 text-sm font-semibold flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
          Couleurs Vespa
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => handlePresetClick(color.hex)}
              className={`group relative aspect-square rounded-xl overflow-hidden transition-all ${
                currentColor.toLowerCase() === color.hex.toLowerCase()
                  ? 'ring-4 ring-amber-400 scale-110 shadow-2xl'
                  : 'ring-2 ring-white/20 hover:ring-amber-400/50 hover:scale-105 shadow-lg'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {currentColor.toLowerCase() === color.hex.toLowerCase() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 rounded-full bg-black" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Input */}
      <div className="space-y-3">
        <Label className="text-white/80 text-sm font-semibold flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
          Couleur Personnalisée
        </Label>
        <div className="flex gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => handleCustomInputChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 transition-all"
            maxLength={7}
          />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-14 h-14 rounded-xl cursor-pointer border-2 border-white/20 bg-transparent"
            title="Sélecteur de couleur"
          />
        </div>
        <p className="text-white/40 text-xs">
          Entrez un code hex (ex: #FF5733) ou utilisez le sélecteur
        </p>
      </div>

      {/* Reset Button */}
      <Button
        onClick={handleReset}
        variant="outline"
        className="w-full border-2 border-white/30 text-white hover:bg-white/10 hover:border-amber-400 transition-all py-6 rounded-xl font-semibold"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Réinitialiser (Vert Jungle)
      </Button>
    </div>
  )
}

