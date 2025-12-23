'use client'

import { useState, Suspense, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { loginAction } from './actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const [showPassword, setShowPassword] = useState(false)
  
  // Use useActionState for error handling - redirect is handled by Next.js natively
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-32 pb-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px]" />
        
        <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl font-black bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Connexion
            </CardTitle>
            <CardDescription className="text-white/60">
              Accédez à votre espace Boss Vespa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-5">
              {/* Hidden input for callbackUrl - no client wrapper needed */}
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              {state?.error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-sm">
                  {state.error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    className="bg-white/10 border-white/10 text-white pl-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-white/90 font-medium">
                    Mot de passe
                  </Label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="bg-white/10 border-white/10 text-white pl-10 pr-10 h-12 focus:ring-amber-400/20 focus:border-amber-400/50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-bold text-base shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2 pb-8">
            <div className="flex items-center gap-2 w-full">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-xs text-white/40 uppercase tracking-widest px-2">ou</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>
            
            <p className="text-sm text-white/60 text-center">
              Pas encore de compte ?{' '}
              <Link 
                href="/auth/register" 
                className="text-amber-400 hover:text-amber-300 transition-colors font-bold"
              >
                Inscrivez-vous gratuitement
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-gray-900 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

