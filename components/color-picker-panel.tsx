'use client'

import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { RotateCcw, Plus } from 'lucide-react'
import { VESPA_MODELS, VespaModel } from '@/utils/color-matching'

type ColorPickerPanelProps = {
  currentColor: string
  onColorChange: (color: string) => void
  selectedModel?: VespaModel | null
  onModelChange?: (model: VespaModel | null) => void
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

export function ColorPickerPanel({ 
  currentColor, 
  onColorChange,
  selectedModel,
  onModelChange
}: ColorPickerPanelProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)

  const handlePresetClick = (hex: string) => {
    onColorChange(hex)
  }

  const handleCustomColorClick = () => {
    colorInputRef.current?.click()
  }

  const handleReset = () => {
    onColorChange(DEFAULT_COLOR)
  }

  const currentColorName = PRESET_COLORS.find(
    (c: { hex: string; name: string }) => c.hex.toLowerCase() === currentColor.toLowerCase()
  )?.name

  return (
    <div className="h-full flex flex-col justify-start lg:justify-center space-y-4 lg:space-y-5 px-4 lg:px-6 py-4 lg:py-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg lg:text-xl font-bold text-white">Personnalisation</h2>
        <p className="text-white/60 text-xs">
          Choisissez votre modèle et couleur
        </p>
      </div>

      {/* Model Selector */}
      {onModelChange && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
            Modèle Vespa <span className="text-amber-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {VESPA_MODELS.map((model) => (
              <button
                key={model}
                onClick={() => onModelChange(model)}
                className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedModel === model
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {model}
              </button>
            ))}
          </div>
          {!selectedModel && (
            <p className="text-amber-400/80 text-xs">
              Veuillez sélectionner un modèle
            </p>
          )}
        </div>
      )}

      {/* Colors Grid */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white/50 uppercase tracking-wider">
          Couleur
        </label>
        <div className="grid grid-cols-5 gap-2 lg:gap-3 justify-items-center">
          {/* Custom Color Button (Plus Sign) */}
          <div className="relative group">
            <button
              onClick={handleCustomColorClick}
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-linear-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px] shadow-lg transition-transform hover:scale-110 active:scale-95"
              title="Couleur personnalisée"
            >
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <Plus className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
            </button>
             <input
              ref={colorInputRef}
              type="color"
              value={currentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute opacity-0 inset-0 w-full h-full cursor-pointer pointer-events-none"
            />
          </div>

          {/* Preset Colors */}
          {PRESET_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => handlePresetClick(color.hex)}
              className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full shadow-md transition-transform hover:scale-110 active:scale-95 border-2 ${
                currentColor.toLowerCase() === color.hex.toLowerCase()
                  ? 'border-white ring-2 ring-white/20'
                  : 'border-transparent hover:border-white/50'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Current Selection Info */}
       <div className="text-center space-y-1">
          <p className="text-white font-medium text-sm">
            {currentColorName || 'Couleur Personnalisée'}
          </p>
          <p className="text-white/40 font-mono text-xs uppercase">{currentColor}</p>
        </div>

      {/* Actions */}
      <div className="pt-2">
        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="w-full text-white/50 hover:text-white hover:bg-white/5 text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1.5" />
          Réinitialiser
        </Button>
      </div>
    </div>
  )
}
