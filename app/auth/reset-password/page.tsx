'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const [checkingToken, setCheckingToken] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setIsTokenValid(false)
        setCheckingToken(false)
        return
      }

      try {
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        setIsTokenValid(response.ok)
      } catch (err) {
        console.error(err)
        setIsTokenValid(false)
      } finally {
        setCheckingToken(false)
      }
    }

    validateToken()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return toast({
        title: 'Erreur de validation',
        description: 'Les mots de passe ne correspondent pas.',
        variant: 'destructive',
      })
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la réinitialisation')
      }

      setSuccess(true)
      toast({
        title: 'Mot de passe réinitialisé',
        description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
      })
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Une erreur est survenue.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (checkingToken) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
        <p className="text-white/60">Vérification de la validité du lien...</p>
      </div>
    )
  }

  if (!token || isTokenValid === false) {
    return (
      <div className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="text-red-500 w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Lien invalide ou expiré</h3>
          <p className="text-white/60 max-w-xs mx-auto">
            Désolé, ce lien de réinitialisation n&apos;est plus valide ou a déjà été utilisé.
          </p>
        </div>
        <Button asChild className="bg-amber-400 text-black hover:bg-amber-300 font-bold">
          <Link href="/auth/forgot-password">Nouvelle demande</Link>
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="text-emerald-500 w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Mot de passe réinitialisé !</h3>
          <p className="text-white/60">
            Votre nouveau mot de passe a été enregistré avec succès.
          </p>
        </div>
        <Button asChild className="w-full bg-amber-400 text-black hover:bg-amber-300 font-bold h-12">
          <Link href="/auth/login">Se connecter maintenant</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-3xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Réinitialisation
        </CardTitle>
        <CardDescription className="text-white/60">
          Choisissez votre nouveau mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90 font-medium">
              Nouveau mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="6 caractères minimum"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/90 font-medium">
              Confirmer le mot de passe
            </Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-base transition-all active:scale-[0.98]" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </Button>
        </form>
      </CardContent>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
          <Suspense fallback={
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-white/60">Chargement...</p>
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
          
          <CardFooter className="bg-white/5 py-4 flex justify-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <Lock size={14} className="text-amber-400/60" />
              Sécurité assurée par Boss Vespa
            </Link>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

