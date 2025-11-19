'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export function WebGLFallback() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-gray-900">
      <div className="max-w-md mx-4 text-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-full p-4 inline-block mb-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        
        <h2 className="text-white text-2xl font-bold mb-3">
          Erreur de rendu 3D
        </h2>
        
        <p className="text-white/70 mb-6">
          Impossible de charger le modèle 3D. Cela peut être dû à:
        </p>
        
        <ul className="text-white/60 text-sm mb-6 text-left space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Trop d'onglets utilisant la 3D (fermez quelques onglets)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Accélération matérielle désactivée dans votre navigateur</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">•</span>
            <span>Mémoire GPU insuffisante</span>
          </li>
        </ul>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRefresh}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
          
          <Button
            onClick={() => window.location.href = '/collection'}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Voir la collection
          </Button>
        </div>
        
        <p className="text-xs text-white/40 mt-6">
          Si le problème persiste, essayez de fermer d'autres onglets ou de redémarrer votre navigateur.
        </p>
      </div>
    </div>
  )
}

